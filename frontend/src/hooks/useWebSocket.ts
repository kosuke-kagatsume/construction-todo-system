import { useEffect, useRef, useCallback } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

interface WebSocketMessage {
  type: 'notification' | 'connection_established' | 'pong' | 'status' | 'system_message';
  data?: any;
  message?: string;
  timestamp?: string;
}

interface NotificationData {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action_url?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export const useWebSocket = (url?: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // Start with 2 seconds
  
  const { addNotification } = useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const defaultUrl = process.env.NODE_ENV === 'production'
    ? 'wss://your-api-domain.com/api/v1/notifications/ws'
    : 'ws://localhost:8000/api/v1/notifications/ws';
  
  const wsUrl = url || defaultUrl;
  
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      console.log('WebSocket message received:', message);
      
      switch (message.type) {
        case 'notification':
          if (message.data) {
            const notificationData: NotificationData = message.data;
            
            // Convert backend notification to frontend format
            addNotification({
              type: notificationData.type as any, // Type assertion for enum conversion
              priority: notificationData.priority,
              title: notificationData.title,
              message: notificationData.message,
              actionUrl: notificationData.action_url,
              metadata: notificationData.metadata,
              // Map additional fields if needed
              relatedProject: notificationData.metadata?.project_name ? {
                id: notificationData.metadata.project_id || '',
                name: notificationData.metadata.project_name,
              } : undefined,
            });
          }
          break;
          
        case 'connection_established':
          console.log('WebSocket connection established:', message.message);
          reconnectAttempts.current = 0; // Reset reconnection attempts
          break;
          
        case 'pong':
          console.log('Pong received');
          break;
          
        case 'status':
          console.log('Status update:', message);
          break;
          
        case 'system_message':
          console.log('System message:', message.message);
          // Could add system messages as notifications if needed
          if (message.message) {
            addNotification({
              type: 'system_update',
              priority: 'low',
              title: 'システムメッセージ',
              message: message.message,
            });
          }
          break;
          
        default:
          console.log('Unknown message type:', message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [addNotification]);
  
  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, skipping WebSocket connection');
      return;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Send authentication/user identification
        // Note: In production, authentication should be handled properly
        // This is a simplified version for development
        if (wsRef.current && user) {
          wsRef.current.send(JSON.stringify({
            type: 'auth',
            user_id: user.id,
            // token: user.token // Include JWT token for authentication
          }));
        }
      };
      
      wsRef.current.onmessage = handleMessage;
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Only attempt to reconnect if it wasn't a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current); // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached');
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [wsUrl, isAuthenticated, user, handleMessage]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      console.log('Disconnecting WebSocket');
      wsRef.current.close(1000, 'Manual disconnect'); // Clean close
      wsRef.current = null;
    }
  }, []);
  
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('Message sent:', message);
      return true;
    } else {
      console.log('WebSocket not connected, cannot send message');
      return false;
    }
  }, []);
  
  const sendPing = useCallback(() => {
    return sendMessage({ type: 'ping' });
  }, [sendMessage]);
  
  const markNotificationAsRead = useCallback((notificationId: string) => {
    return sendMessage({
      type: 'mark_read',
      notification_id: notificationId
    });
  }, [sendMessage]);
  
  const getStatus = useCallback(() => {
    return sendMessage({ type: 'get_status' });
  }, [sendMessage]);
  
  // Set up connection and cleanup
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isAuthenticated, user]);
  
  // Heartbeat to keep connection alive
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendPing();
      }
    }, 30000); // Send ping every 30 seconds
    
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [sendPing]);
  
  return {
    connect,
    disconnect,
    sendMessage,
    sendPing,
    markNotificationAsRead,
    getStatus,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    connectionState: wsRef.current?.readyState,
  };
};