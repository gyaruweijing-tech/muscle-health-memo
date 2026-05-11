import anthropic
import os
import re

APP_JSX_PATH = r"C:\learning-react\health-memo\src\App.jsx"
MAX_RETRIES = 2

client = anthropic.Anthropic()


# ── 開発エージェント ──────────────────────────────────────────
def dev_agent(current_code: str, feedback: str = "") -> tuple[str, str]:
    """UIプロとしてApp.jsxを改善する。(new_code, explanation) を返す"""

    retry_instruction = ""
    if feedback:
        retry_instruction = f"""
前回のレビューで以下のフィードバックがありました。必ず対応してください：
{feedback}
"""

    messages = [
        {
            "role": "user",
            "content": f"""以下のReactコードをUIプロとして改善してください。
{retry_instruction}
【絶対に守るルール】
- 既存の機能を一切削除・変更しない（カレンダー、記録、タイマー、種目管理、localStorageの保存・削除）
- 外部CSSライブラリ（Tailwind、MUI等）は使わない（スタンドアロンを維持）
- ファイル構成はそのままApp.jsxのみ

【デザインの方向性】
- ライト系・モダン（白・明るめ、クリーンでミニマル）
- インラインスタイルを整理して読みやすくする
- カラーパレットを統一感のあるものにする
- 余白・タイポグラフィのリズムを改善
- ボタン・カードのビジュアルをモダンに
- 操作フィードバック（ホバー状態など）を追加

【現在のApp.jsxコード】
```jsx
{current_code}
```

【出力形式】
まず改善内容の説明（日本語で箇条書き）を書いてください。
その後、以下のタグで囲んだ完全なApp.jsxコードを出力してください：
<NEW_CODE>
（完全なコードをここに）
</NEW_CODE>
""",
        }
    ]

    print("  [開発エージェント] UIの改善案を作成中...")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        system="あなたはUIデザインとReact開発の10年以上のプロフェッショナルです。機能を壊さずに美しくモダンなUIを実現します。",
        messages=messages,
    )

    content = response.content[0].text

    match = re.search(r"<NEW_CODE>\n?(.*?)\n?</NEW_CODE>", content, re.DOTALL)
    if not match:
        raise ValueError("開発エージェントがコードを返しませんでした")

    new_code = match.group(1).strip()
    explanation = content[: match.start()].strip()

    print("  [開発エージェント] 完了")
    return new_code, explanation


# ── レビューエージェント ──────────────────────────────────────
def review_agent(original_code: str, proposed_code: str, explanation: str) -> tuple[bool, str]:
    """改善案をレビューする。(is_ok, feedback) を返す"""

    print("  [レビューエージェント] コードをレビュー中...")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system="あなたはシニアフロントエンドエンジニアです。コードレビューで機能の欠落やバグを見つけるのが得意です。",
        messages=[
            {
                "role": "user",
                "content": f"""以下の改善案をレビューしてください。

【改善内容の説明】
{explanation}

【元のコード】
```jsx
{original_code}
```

【改善後のコード】
```jsx
{proposed_code}
```

【チェック項目】
1. カレンダー機能（月移動、日付クリック、記録表示、削除）が残っているか
2. ワークアウト記録機能（種目選択、重量・回数・セット、リスト追加・削除・並び替え）が残っているか
3. タイマー機能（ストップウォッチ、カウントダウン、記録追加）が残っているか
4. 種目管理（追加・削除・並び替え）が残っているか
5. localStorageの保存・読み込みが残っているか
6. デザインが実際にモダンでライト系になっているか
7. 構文エラーや明らかなバグがないか

【出力形式】
各チェック項目の結果を書いてから、最後に必ず以下のどちらかで締めてください：
VERDICT: OK
VERDICT: NG - （具体的な問題点）
""",
            }
        ],
    )

    content = response.content[0].text
    print("  [レビューエージェント] 完了")

    is_ok = "VERDICT: OK" in content
    return is_ok, content


# ── オーケストレーター ────────────────────────────────────────
def orchestrator():
    print("=" * 50)
    print("IRON NOTE UI 改善エージェント 起動")
    print("=" * 50)

    with open(APP_JSX_PATH, "r", encoding="utf-8") as f:
        original_code = f.read()

    print(f"\nApp.jsx を読み込みました ({len(original_code)} 文字)\n")

    feedback = ""
    for attempt in range(1, MAX_RETRIES + 1):
        print(f"--- ラウンド {attempt} / {MAX_RETRIES} ---")

        new_code, explanation = dev_agent(original_code, feedback)

        print(f"\n【開発エージェントの改善内容】\n{explanation}\n")

        is_ok, review_result = review_agent(original_code, new_code, explanation)

        print(f"\n【レビュー結果】\n{review_result}\n")

        if is_ok:
            print("オーケストレーター: レビューOK → App.jsx を書き換えます\n")

            backup_path = APP_JSX_PATH.replace(".jsx", "_backup.jsx")
            with open(backup_path, "w", encoding="utf-8") as f:
                f.write(original_code)
            print(f"バックアップ保存: {backup_path}")

            with open(APP_JSX_PATH, "w", encoding="utf-8") as f:
                f.write(new_code)

            print(f"App.jsx を更新しました")
            print("\n完了！npm run dev で確認してください。")
            return

        else:
            ng_match = re.search(r"VERDICT: NG - (.+)", review_result)
            feedback = ng_match.group(1) if ng_match else review_result
            print(f"オーケストレーター: レビューNG → 再試行します\nフィードバック: {feedback}\n")

    print("最大リトライ回数に達しました。改善に失敗しました。")


if __name__ == "__main__":
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("エラー: ANTHROPIC_API_KEY 環境変数が設定されていません")
        print("設定方法: $env:ANTHROPIC_API_KEY = 'your-api-key'")
        exit(1)

    orchestrator()
