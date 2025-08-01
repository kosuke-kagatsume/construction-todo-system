#!/usr/bin/env python3
"""
Focused Analysis Script for Construction TODO Management System
"""

import pandas as pd
import openpyxl
from pathlib import Path

def analyze_workflow_structure(file_path, file_description):
    """Extract key workflow structure and data patterns"""
    print(f"\n{'='*60}")
    print(f"FOCUSED ANALYSIS: {file_description}")
    print(f"{'='*60}")
    
    if not Path(file_path).exists():
        print(f"ERROR: File not found at {file_path}")
        return None
    
    try:
        # Get sheet names
        wb = openpyxl.load_workbook(file_path, read_only=True)
        sheet_names = wb.sheetnames
        print(f"Sheets: {sheet_names}")
        wb.close()
        
        results = {}
        
        for sheet_name in sheet_names:
            print(f"\n--- {sheet_name} ---")
            
            try:
                # Read with different approaches to handle headers
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
                print(f"Size: {df.shape[0]} rows × {df.shape[1]} columns")
                
                # Find workflow stages and roles in the data
                workflow_items = []
                role_assignments = []
                date_patterns = []
                
                for i in range(min(20, len(df))):
                    for j in range(min(20, df.shape[1])):
                        cell_value = df.iloc[i, j]
                        if pd.notna(cell_value):
                            cell_str = str(cell_value).strip()
                            
                            # Check for workflow stages
                            workflow_keywords = ['追客', '契約', '打ち合わせ', '施工', '竣工', 'プラン', '設計', '申込', '着工', '上棟', '完成', '引渡']
                            for keyword in workflow_keywords:
                                if keyword in cell_str:
                                    workflow_items.append((i, j, cell_str))
                                    break
                            
                            # Check for roles
                            if cell_str in ['営業', '設計', 'IC', '工務']:
                                role_assignments.append((i, j, cell_str))
                            
                            # Check for date patterns
                            if any(char in cell_str for char in ['/', '月', '日']) or 'REF' in cell_str:
                                if len(cell_str) < 50:  # Skip long text
                                    date_patterns.append((i, j, cell_str))
                
                # Look for key column headers
                key_columns = []
                for i in range(min(5, len(df))):
                    row_data = df.iloc[i].fillna('').astype(str).tolist()
                    for j, cell in enumerate(row_data):
                        if any(keyword in cell for keyword in ['邸名', 'フェーズ', 'グレード', '営業', '設計', 'IC', '工務', '目標', '基礎', '上棟']):
                            key_columns.append((i, j, cell))
                
                results[sheet_name] = {
                    'dimensions': df.shape,
                    'workflow_items': workflow_items[:10],  # Top 10
                    'role_assignments': role_assignments,
                    'key_columns': key_columns[:15],  # Top 15
                    'date_patterns_count': len(date_patterns)
                }
                
                print(f"  Workflow items found: {len(workflow_items)}")
                print(f"  Role assignments: {len(role_assignments)}")
                print(f"  Key columns: {len(key_columns)}")
                print(f"  Date patterns: {len(date_patterns)}")
                
                if workflow_items:
                    print("  Sample workflow items:")
                    for row, col, text in workflow_items[:5]:
                        print(f"    [{row},{col}]: {text[:50]}...")
                
                if key_columns:
                    print("  Key column headers:")
                    for row, col, text in key_columns[:8]:
                        print(f"    [{row},{col}]: {text}")
                        
            except Exception as e:
                print(f"  Error analyzing sheet: {str(e)}")
                continue
        
        return results
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

def extract_detailed_workflow_stages():
    """Extract detailed workflow stages from the visible data"""
    
    # Based on the analysis output, extract the workflow stages
    stages_from_data = [
        # Planning phase
        "設計申込", "プランヒアリング", "1stプラン提案", "2ndプラン提案", "3rdプラン提案", "EXプラン提案",
        
        # Contract phase  
        "契約前打合せ", "請負契約", "建築請負契約",
        
        # Design phase
        "1st仕様打合せ", "2nd仕様打合せ", "3rd仕様打合せ", "4th仕様打合せ", "5th仕様打合せ", "EX仕様打合せ",
        "FBヒアリング", "三者会議", "プレカット会議", "着工前仕様確認",
        
        # Construction phase
        "地鎮祭準備", "地鎮祭", "地盤改良", "基礎着工", "配筋検査", "アンカーチェック", "土台伏せ検査",
        "上棟", "ルーフィング検査", "金物検査", "透湿防水検査", "断熱工事施主検査", "外壁仕上がり確認",
        "木完検査", "追加変更契約", "設備保証書等回収", "社内完了検査",
        
        # Completion phase
        "見学会", "施主完了検査", "完成検査", "引渡式"
    ]
    
    # Group into main phases
    workflow_phases = {
        "追客・設計": ["設計申込", "プランヒアリング", "1stプラン提案", "2ndプラン提案", "3rdプラン提案", "EXプラン提案"],
        "契約": ["契約前打合せ", "請負契約", "建築請負契約"],
        "打ち合わせ": ["1st仕様打合せ", "2nd仕様打合せ", "3rd仕様打合せ", "4th仕様打合せ", "5th仕様打合せ", "EX仕様打合せ", "FBヒアリング", "三者会議", "プレカット会議", "着工前仕様確認"],
        "施工": ["地鎮祭準備", "地鎮祭", "地盤改良", "基礎着工", "配筋検査", "アンカーチェック", "土台伏せ検査", "上棟", "ルーフィング検査", "金物検査", "透湿防水検査", "断熱工事施主検査", "外壁仕上がり確認", "木完検査", "追加変更契約", "設備保証書等回収", "社内完了検査"],
        "竣工": ["見学会", "施主完了検査", "完成検査", "引渡式"]
    }
    
    return workflow_phases

def main():
    print("Construction TODO Management System - Focused Analysis")
    print("=" * 70)
    
    # File paths
    file1_path = "/Users/dw100/Downloads/参考用_原本 (1).xlsx"
    file2_path = "/Users/dw100/Downloads/参考用_現場ボード (1).xlsx"
    
    # Analyze both files
    results1 = analyze_workflow_structure(file1_path, "Individual Project Detail TODO Management")
    results2 = analyze_workflow_structure(file2_path, "Central Management Board")
    
    # Extract workflow phases
    workflow_phases = extract_detailed_workflow_stages()
    
    print(f"\n{'='*70}")
    print("COMPREHENSIVE WORKFLOW ANALYSIS")
    print(f"{'='*70}")
    
    print("\n1. WORKFLOW PHASES (追客→契約→打ち合わせ→施工→竣工):")
    for phase, stages in workflow_phases.items():
        print(f"\n   {phase}:")
        for i, stage in enumerate(stages, 1):
            print(f"     {i:2d}. {stage}")
    
    print(f"\n2. ROLES IDENTIFIED:")
    roles = ["営業 (Sales)", "設計 (Design)", "IC (Interior Coordinator)", "工務 (Construction Management)"]
    for role in roles:
        print(f"   - {role}")
    
    print(f"\n3. FILE STRUCTURE ANALYSIS:")
    
    if results1:
        print(f"\n   Individual Project File (原本):")
        print(f"   - Purpose: Detailed task management for single project")
        print(f"   - Sheets: {list(results1.keys())}")
        print(f"   - Contains project-specific information and checklists")
        print(f"   - Links to central board via '一覧反映' flag")
    
    if results2:
        print(f"\n   Central Management Board (現場ボード):")
        print(f"   - Purpose: Overview of all projects and scheduling")
        print(f"   - Sheets: {list(results2.keys())}")
        print(f"   - Multiple filtered views for different purposes:")
        for sheet in results2.keys():
            if 'フィルタ' in sheet:
                print(f"     * {sheet}")
        print(f"   - Aggregates data from individual project files")
    
    print(f"\n4. KEY SYSTEM FEATURES:")
    print(f"   - Two-tier structure: Individual projects → Central board")
    print(f"   - Date tracking: 実施済日程 (completed) vs 予測日程 (predicted)")
    print(f"   - Progress monitoring with completion checkmarks")
    print(f"   - Milestone tracking (基礎着工, 上棟 targets)")
    print(f"   - Cross-referencing between sheets via URLs")
    print(f"   - Filtered views for different stakeholder needs")

if __name__ == "__main__":
    main()