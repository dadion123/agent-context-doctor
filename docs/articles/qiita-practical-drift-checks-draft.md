# AGENTS.md / CLAUDE.md / Cursor rules のズレをCLIで検出する

## 想定タイトル

AGENTS.mdとCLAUDE.mdのズレをCIで検出するCLIを作った

## この記事で扱うこと

- AIコーディング向けcontext fileがズレる理由
- Agent Context Doctorで見ているチェック
- GitHub Actionsでの使い方
- safe fixでやってよいこと、まだやらないこと

## よくあるズレ

### READMEとAGENTS.mdのコマンドが違う

READMEでは `pnpm build` なのに、AGENTS.mdには `npm run build` が残るケース。

### package.json scriptsがAI contextに書かれていない

`test` / `build` / `lint` がpackage.jsonにあるのに、AI向けファイルに書かれていないケース。

### .env.exampleはあるが説明がない

AIエージェントがセットアップ手順を推測してしまいやすい状態です。

### AGENTS.mdとCLAUDE.mdが二重管理になる

両方に同じ長い説明を書くと、片方だけ更新されてズレます。

## 導入

```bash
npx agent-context-doctor@latest scan . --locale ja
```

CIでは次のように使います。

```yaml
name: Agent Context Doctor

on:
  pull_request:

jobs:
  acd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dadion123/agent-context-doctor@v0.1.1
        with:
          path: "."
          min-score: "80"
          locale: "ja"
```

## safe fix

`fix` はデフォルトではdry-runです。

```bash
npx agent-context-doctor@latest fix . --dry-run
npx agent-context-doctor@latest fix . --apply
```

現在の自動修正は低リスクなものに限定しています。

- `.gitignore` に `.env` を追加
- READMEに `.env.example` の説明を追加

`.env` の中身は読みません。

## リンク

- GitHub: https://github.com/dadion123/agent-context-doctor
- npm: https://www.npmjs.com/package/agent-context-doctor
