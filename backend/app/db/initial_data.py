"""
初期マスターデータの定義
エクセル分析から抽出した44のステージと標準タスク
"""

PHASES = [
    {"code": "LEAD", "name": "追客・設計", "display_order": 1, "color_code": "#2196F3"},
    {"code": "CONTRACT", "name": "契約", "display_order": 2, "color_code": "#4CAF50"},
    {"code": "MEETING", "name": "打ち合わせ", "display_order": 3, "color_code": "#FF9800"},
    {"code": "CONSTRUCTION", "name": "施工", "display_order": 4, "color_code": "#F44336"},
    {"code": "COMPLETION", "name": "竣工", "display_order": 5, "color_code": "#9C27B0"},
]

STAGES = [
    # 追客・設計フェーズ
    {"phase_code": "LEAD", "code": "DESIGN_APP", "name": "設計申込", "display_order": 1},
    {"phase_code": "LEAD", "code": "PLAN_HEARING", "name": "プランヒアリング", "display_order": 2},
    {"phase_code": "LEAD", "code": "1ST_PLAN", "name": "1stプラン提案", "display_order": 3},
    {"phase_code": "LEAD", "code": "2ND_PLAN", "name": "2ndプラン提案", "display_order": 4},
    {"phase_code": "LEAD", "code": "3RD_PLAN", "name": "3rdプラン提案", "display_order": 5},
    {"phase_code": "LEAD", "code": "EX_PLAN", "name": "EXプラン提案", "display_order": 6},
    
    # 契約フェーズ
    {"phase_code": "CONTRACT", "code": "PRE_CONTRACT_MTG", "name": "契約前打合せ", "display_order": 7},
    {"phase_code": "CONTRACT", "code": "CONTRACT", "name": "請負契約", "display_order": 8},
    {"phase_code": "CONTRACT", "code": "BUILD_CONTRACT", "name": "建築請負契約", "display_order": 9},
    
    # 打ち合わせフェーズ
    {"phase_code": "MEETING", "code": "1ST_SPEC_MTG", "name": "1st仕様打合せ", "display_order": 10},
    {"phase_code": "MEETING", "code": "2ND_SPEC_MTG", "name": "2nd仕様打合せ", "display_order": 11},
    {"phase_code": "MEETING", "code": "3RD_SPEC_MTG", "name": "3rd仕様打合せ", "display_order": 12},
    {"phase_code": "MEETING", "code": "4TH_SPEC_MTG", "name": "4th仕様打合せ", "display_order": 13},
    {"phase_code": "MEETING", "code": "5TH_SPEC_MTG", "name": "5th仕様打合せ", "display_order": 14},
    {"phase_code": "MEETING", "code": "EX_SPEC_MTG", "name": "EX仕様打合せ", "display_order": 15},
    {"phase_code": "MEETING", "code": "FB_HEARING", "name": "FBヒアリング", "display_order": 16},
    {"phase_code": "MEETING", "code": "THREE_PARTY_MTG", "name": "三者会議", "display_order": 17},
    {"phase_code": "MEETING", "code": "PRECUT_MTG", "name": "プレカット会議", "display_order": 18},
    {"phase_code": "MEETING", "code": "PRE_CONST_CONFIRM", "name": "着工前仕様確認", "display_order": 19},
    
    # 施工フェーズ
    {"phase_code": "CONSTRUCTION", "code": "GROUND_CEREMONY_PREP", "name": "地鎮祭準備", "display_order": 20},
    {"phase_code": "CONSTRUCTION", "code": "GROUND_CEREMONY", "name": "地鎮祭", "display_order": 21},
    {"phase_code": "CONSTRUCTION", "code": "GROUND_IMPROVE", "name": "地盤改良", "display_order": 22},
    {"phase_code": "CONSTRUCTION", "code": "FOUNDATION_START", "name": "基礎着工", "display_order": 23, "is_milestone": True},
    {"phase_code": "CONSTRUCTION", "code": "REBAR_INSPECT", "name": "配筋検査", "display_order": 24},
    {"phase_code": "CONSTRUCTION", "code": "ANCHOR_CHECK", "name": "アンカーチェック", "display_order": 25},
    {"phase_code": "CONSTRUCTION", "code": "FOUNDATION_FRAME", "name": "土台伏せ検査", "display_order": 26},
    {"phase_code": "CONSTRUCTION", "code": "ROOFING", "name": "上棟", "display_order": 27, "is_milestone": True},
    {"phase_code": "CONSTRUCTION", "code": "ROOFING_INSPECT", "name": "ルーフィング検査", "display_order": 28},
    {"phase_code": "CONSTRUCTION", "code": "HARDWARE_INSPECT", "name": "金物検査", "display_order": 29},
    {"phase_code": "CONSTRUCTION", "code": "MOISTURE_INSPECT", "name": "透湿防水検査", "display_order": 30},
    {"phase_code": "CONSTRUCTION", "code": "INSULATION_INSPECT", "name": "断熱工事施主検査", "display_order": 31},
    {"phase_code": "CONSTRUCTION", "code": "EXTERIOR_CONFIRM", "name": "外壁仕上がり確認", "display_order": 32},
    {"phase_code": "CONSTRUCTION", "code": "WOOD_COMPLETE", "name": "木完検査", "display_order": 33},
    {"phase_code": "CONSTRUCTION", "code": "CHANGE_CONTRACT", "name": "追加変更契約", "display_order": 34},
    {"phase_code": "CONSTRUCTION", "code": "WARRANTY_COLLECT", "name": "設備保証書等回収", "display_order": 35},
    {"phase_code": "CONSTRUCTION", "code": "INTERNAL_INSPECT", "name": "社内完了検査", "display_order": 36},
    
    # 竣工フェーズ
    {"phase_code": "COMPLETION", "code": "OPEN_HOUSE", "name": "見学会", "display_order": 37},
    {"phase_code": "COMPLETION", "code": "OWNER_INSPECT", "name": "施主完了検査", "display_order": 38},
    {"phase_code": "COMPLETION", "code": "FINAL_INSPECT", "name": "完成検査", "display_order": 39},
    {"phase_code": "COMPLETION", "code": "HANDOVER", "name": "引渡式", "display_order": 40},
]

ROLES = [
    {"code": "SALES", "name": "営業"},
    {"code": "DESIGN", "name": "設計"},
    {"code": "IC", "name": "IC"},
    {"code": "CONSTRUCTION", "name": "工務"},
]

# 各ステージのデフォルトタスクテンプレート（サンプル）
TASK_TEMPLATES = [
    # 設計申込ステージのタスク例
    {
        "stage_code": "DESIGN_APP",
        "code": "DESIGN_APP_RECEIVE",
        "name": "設計申込書受領",
        "default_assignee_role": "SALES",
        "display_order": 1,
        "checklist_items": ["申込書記入内容確認", "顧客情報登録", "設計担当者アサイン"]
    },
    {
        "stage_code": "DESIGN_APP",
        "code": "DESIGN_APP_PROCESS",
        "name": "設計申込処理",
        "default_assignee_role": "DESIGN",
        "display_order": 2,
        "checklist_items": ["敷地調査依頼", "法規制確認", "プラン作成準備"]
    },
    # 他のステージのタスクも同様に定義...
]