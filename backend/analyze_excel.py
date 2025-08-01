#!/usr/bin/env python3
"""
Excel File Analysis Script for Construction TODO Management System
Analyzes two Excel files:
1. Individual project detail TODO management
2. Central management board for all projects
"""

import pandas as pd
import openpyxl
import sys
from pathlib import Path

def analyze_excel_file(file_path, file_description):
    """Analyze a single Excel file and return detailed information"""
    print(f"\n{'='*80}")
    print(f"ANALYZING: {file_description}")
    print(f"File: {file_path}")
    print(f"{'='*80}")
    
    try:
        # Check if file exists
        if not Path(file_path).exists():
            print(f"ERROR: File not found at {file_path}")
            return None
            
        # Load the workbook to get sheet names
        wb = openpyxl.load_workbook(file_path, read_only=True)
        sheet_names = wb.sheetnames
        print(f"Sheet Names: {sheet_names}")
        wb.close()
        
        analysis_results = {}
        
        # Analyze each sheet
        for sheet_name in sheet_names:
            print(f"\n--- SHEET: {sheet_name} ---")
            
            try:
                # Read the sheet
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
                
                print(f"Dimensions: {df.shape[0]} rows × {df.shape[1]} columns")
                
                # Show first few rows to understand structure
                print("\nFirst 10 rows (raw data):")
                for i, row in df.head(10).iterrows():
                    print(f"Row {i}: {list(row.values)}")
                
                # Try to identify header row by looking for common patterns
                potential_headers = []
                for i in range(min(5, len(df))):
                    row_values = [str(val).strip() if pd.notna(val) else '' for val in df.iloc[i]]
                    if any(keyword in ''.join(row_values).lower() for keyword in ['項目', 'todo', '営業', '設計', 'ic', '追客', '契約', '打ち合わせ', '施工', '竣工']):
                        potential_headers.append((i, row_values))
                
                if potential_headers:
                    print(f"\nPotential header rows found:")
                    for row_idx, headers in potential_headers:
                        print(f"Row {row_idx}: {headers}")
                
                # Look for specific workflow stages
                workflow_stages = ['追客', '契約', '打ち合わせ', '施工', '竣工']
                roles = ['営業', '設計', 'IC']
                
                found_stages = []
                found_roles = []
                
                for i, row in df.iterrows():
                    row_text = ' '.join([str(val) for val in row.values if pd.notna(val)])
                    for stage in workflow_stages:
                        if stage in row_text and stage not in found_stages:
                            found_stages.append(stage)
                    for role in roles:
                        if role in row_text and role not in found_roles:
                            found_roles.append(role)
                
                print(f"\nWorkflow stages found: {found_stages}")
                print(f"Roles found: {found_roles}")
                
                # Look for date patterns
                date_columns = []
                for col in range(df.shape[1]):
                    col_data = df.iloc[:, col].dropna()
                    if len(col_data) > 0:
                        # Check if column contains dates
                        date_like_count = 0
                        for val in col_data.head(20):
                            val_str = str(val)
                            if any(char in val_str for char in ['/', '-', '月', '日', '年']):
                                date_like_count += 1
                        if date_like_count > len(col_data) * 0.3:  # 30% threshold
                            date_columns.append(col)
                
                print(f"Potential date columns: {date_columns}")
                
                # Look for project identifiers
                project_patterns = []
                for i, row in df.head(20).iterrows():
                    for j, val in enumerate(row.values):
                        if pd.notna(val):
                            val_str = str(val)
                            if any(pattern in val_str for pattern in ['プロジェクト', '案件', 'PJ', '工事', '現場']):
                                project_patterns.append((i, j, val_str))
                
                if project_patterns:
                    print(f"Project-related patterns found:")
                    for row_idx, col_idx, value in project_patterns[:5]:
                        print(f"  Row {row_idx}, Col {col_idx}: {value}")
                
                analysis_results[sheet_name] = {
                    'dimensions': df.shape,
                    'potential_headers': potential_headers,
                    'workflow_stages': found_stages,
                    'roles': found_roles,
                    'date_columns': date_columns,
                    'project_patterns': project_patterns,
                    'sample_data': df.head().to_dict()
                }
                
            except Exception as e:
                print(f"Error analyzing sheet {sheet_name}: {str(e)}")
                continue
        
        return analysis_results
        
    except Exception as e:
        print(f"ERROR: Could not analyze file {file_path}: {str(e)}")
        return None

def main():
    # File paths
    file1_path = "/Users/dw100/Downloads/参考用_原本 (1).xlsx"
    file2_path = "/Users/dw100/Downloads/参考用_現場ボード (1).xlsx"
    
    print("Construction TODO Management System - Excel File Analysis")
    print("=" * 80)
    
    # Analyze first file - Individual project detail TODO management
    results1 = analyze_excel_file(file1_path, "Individual Project Detail TODO Management")
    
    # Analyze second file - Central management board for all projects
    results2 = analyze_excel_file(file2_path, "Central Management Board for All Projects")
    
    # Summary analysis
    print(f"\n{'='*80}")
    print("SUMMARY ANALYSIS")
    print(f"{'='*80}")
    
    if results1:
        print(f"\nFile 1 (Individual Project Details):")
        print(f"  - Total sheets: {len(results1)}")
        all_stages1 = set()
        all_roles1 = set()
        for sheet_name, data in results1.items():
            all_stages1.update(data['workflow_stages'])
            all_roles1.update(data['roles'])
        print(f"  - Workflow stages found: {sorted(all_stages1)}")
        print(f"  - Roles found: {sorted(all_roles1)}")
    
    if results2:
        print(f"\nFile 2 (Central Management Board):")
        print(f"  - Total sheets: {len(results2)}")
        all_stages2 = set()
        all_roles2 = set()
        for sheet_name, data in results2.items():
            all_stages2.update(data['workflow_stages'])
            all_roles2.update(data['roles'])
        print(f"  - Workflow stages found: {sorted(all_stages2)}")
        print(f"  - Roles found: {sorted(all_roles2)}")
    
    # Workflow analysis
    expected_workflow = ['追客', '契約', '打ち合わせ', '施工', '竣工']
    expected_roles = ['営業', '設計', 'IC']
    
    print(f"\nExpected Workflow Stages: {expected_workflow}")
    print(f"Expected Roles: {expected_roles}")
    
    if results1 and results2:
        combined_stages = set()
        combined_roles = set()
        for results in [results1, results2]:
            for sheet_name, data in results.items():
                combined_stages.update(data['workflow_stages'])
                combined_roles.update(data['roles'])
        
        print(f"\nCombined Analysis:")
        print(f"  - All workflow stages found: {sorted(combined_stages)}")
        print(f"  - All roles found: {sorted(combined_roles)}")
        print(f"  - Missing workflow stages: {set(expected_workflow) - combined_stages}")
        print(f"  - Missing roles: {set(expected_roles) - combined_roles}")

if __name__ == "__main__":
    main()