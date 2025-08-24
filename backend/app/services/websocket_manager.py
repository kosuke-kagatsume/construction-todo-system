from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import logging
from uuid import UUID
import asyncio

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket接続を管理するクラス"""
    
    def __init__(self):
        # ユーザーID -> WebSocket接続のマッピング
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # WebSocket -> ユーザーIDのマッピング
        self.connection_user_map: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """WebSocket接続を受け入れる"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        self.connection_user_map[websocket] = user_id
        
        logger.info(f"User {user_id} connected via WebSocket")
        
        # 接続確認メッセージを送信
        await self.send_personal_message(user_id, json.dumps({
            "type": "connection_established",
            "message": "WebSocket connection established"
        }))
    
    def disconnect(self, websocket: WebSocket):
        """WebSocket接続を切断する"""
        user_id = self.connection_user_map.get(websocket)
        
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # ユーザーの接続がすべてなくなった場合、キーを削除
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if websocket in self.connection_user_map:
            del self.connection_user_map[websocket]
        
        logger.info(f"User {user_id} disconnected from WebSocket")
    
    async def send_personal_message(self, user_id: str, message: str):
        """特定のユーザーにメッセージを送信"""
        if user_id not in self.active_connections:
            logger.warning(f"No active connections for user {user_id}")
            return
        
        connections = self.active_connections[user_id].copy()
        disconnected_connections = []
        
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                disconnected_connections.append(connection)
        
        # 切断された接続を削除
        for connection in disconnected_connections:
            self.disconnect(connection)
    
    async def send_to_multiple_users(self, user_ids: List[str], message: str):
        """複数のユーザーにメッセージを送信"""
        tasks = []
        for user_id in user_ids:
            if user_id in self.active_connections:
                tasks.append(self.send_personal_message(user_id, message))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def broadcast(self, message: str):
        """全接続にブロードキャスト"""
        all_connections = []
        for connections in self.active_connections.values():
            all_connections.extend(connections)
        
        disconnected_connections = []
        
        for connection in all_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to broadcast message: {e}")
                disconnected_connections.append(connection)
        
        # 切断された接続を削除
        for connection in disconnected_connections:
            self.disconnect(connection)
    
    def get_active_users(self) -> List[str]:
        """アクティブなユーザー一覧を取得"""
        return list(self.active_connections.keys())
    
    def get_user_connection_count(self, user_id: str) -> int:
        """ユーザーの接続数を取得"""
        return len(self.active_connections.get(user_id, set()))
    
    def is_user_online(self, user_id: str) -> bool:
        """ユーザーがオンラインかチェック"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0


# グローバルなWebSocketマネージャーインスタンス
websocket_manager = ConnectionManager()


class NotificationWebSocketHandler:
    """通知用WebSocketハンドラー"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
    
    async def handle_connection(self, websocket: WebSocket, user_id: str):
        """WebSocket接続を処理"""
        try:
            await self.connection_manager.connect(websocket, user_id)
            
            while True:
                try:
                    # クライアントからのメッセージを受信
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    # メッセージタイプに応じて処理
                    await self.handle_message(user_id, message)
                    
                except WebSocketDisconnect:
                    break
                except json.JSONDecodeError:
                    # 無効なJSONは無視
                    logger.warning(f"Invalid JSON received from user {user_id}")
                except Exception as e:
                    logger.error(f"Error handling WebSocket message from user {user_id}: {e}")
        
        except Exception as e:
            logger.error(f"WebSocket connection error for user {user_id}: {e}")
        
        finally:
            self.connection_manager.disconnect(websocket)
    
    async def handle_message(self, user_id: str, message: dict):
        """クライアントからのメッセージを処理"""
        message_type = message.get("type")
        
        if message_type == "ping":
            # ハートビート応答
            await self.connection_manager.send_personal_message(
                user_id,
                json.dumps({"type": "pong"})
            )
        
        elif message_type == "mark_read":
            # 通知既読処理
            notification_id = message.get("notification_id")
            if notification_id:
                # ここで通知を既読にする処理を実装
                await self.mark_notification_as_read(user_id, notification_id)
        
        elif message_type == "get_status":
            # オンラインユーザー数などのステータス情報を送信
            status = {
                "type": "status",
                "online_users": len(self.connection_manager.get_active_users()),
                "your_connections": self.connection_manager.get_user_connection_count(user_id)
            }
            await self.connection_manager.send_personal_message(
                user_id,
                json.dumps(status)
            )
    
    async def mark_notification_as_read(self, user_id: str, notification_id: str):
        """通知を既読にする（実装は後で追加）"""
        # TODO: NotificationServiceを使用して通知を既読にする
        pass
    
    async def send_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        action_url: str = None,
        metadata: dict = None
    ):
        """通知をWebSocket経由で送信"""
        notification_message = {
            "type": "notification",
            "data": {
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "action_url": action_url,
                "metadata": metadata or {},
                "timestamp": "2025-01-25T12:00:00Z"  # 実際にはdatetime.utcnow()を使用
            }
        }
        
        await self.connection_manager.send_personal_message(
            user_id,
            json.dumps(notification_message)
        )
    
    async def send_system_message(self, message: str, user_ids: List[str] = None):
        """システムメッセージを送信"""
        system_message = {
            "type": "system_message",
            "message": message,
            "timestamp": "2025-01-25T12:00:00Z"  # 実際にはdatetime.utcnow()を使用
        }
        
        if user_ids:
            await self.connection_manager.send_to_multiple_users(
                user_ids,
                json.dumps(system_message)
            )
        else:
            await self.connection_manager.broadcast(json.dumps(system_message))


# グローバルな通知WebSocketハンドラーインスタンス
notification_websocket_handler = NotificationWebSocketHandler(websocket_manager)