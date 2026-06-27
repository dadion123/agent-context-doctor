# Agent Context Doctor: AGENTS.md時代の「生成後」を診断するOSS CLI

## 想定タイトル

AGENTS.mdを作って終わりにしない。AIコーディング文脈を診断するOSS CLIを作った

## 要約

`AGENTS.md`、`CLAUDE.md`、Cursor rules、Copilot instructions は、AIコーディングエージェントにリポジトリ文脈を渡すための重要な入口になってきました。

ただし、問題は「最初に作ること」よりも「後からズレること」です。

Agent Context Doctor は、そのズレを診断するdoctor-first CLIです。

## 本文案

AIコーディングエージェントを使うrepoでは、次のようなファイルが増えています。

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md`

これらは便利ですが、運用が進むとREADMEやpackage scriptsとズレます。

たとえばREADMEでは `pnpm test` と書いているのに、AGENTS.mdには古い `npm test` が残る。`.env.example` はあるのに、READMEにもAI向けcontextにも説明がない。`AGENTS.md` と `CLAUDE.md` がほぼ同じ内容で二重管理になる。

こういう状態を、生成ツールではなくdoctorとして見つけるのが Agent Context Doctor です。

## 使い方

```bash
npx agent-context-doctor@latest scan . --locale ja
npx agent-context-doctor@latest ci . --min-score 80
```

GitHub Actionsでも使えます。

```yaml
- uses: dadion123/agent-context-doctor@v0.1.1
  with:
    path: "."
    min-score: "80"
    locale: "ja"
```

## なぜ日本語ファーストか

日本語のOSSメンテナーや個人開発者は、Zenn / QiitaでAIコーディング運用の知見を増やしています。

一方で、日本語repoの文脈を前提に、AIへの言語指示やREADMEとのズレまで診断するOSSはまだ薄いと感じています。

Agent Context Doctorでは、`--locale ja` で日本語レポートを出し、日本語repoではAIエージェントへの言語指示が明確かもチェックします。

## 今後

- GitHub annotations
- SARIF output
- safe patchの拡張
- 日本語OSS repo向けpreset
- Codex / Claude Code / Cursor / Copilot横断のdrift検出強化

## リンク

- GitHub: https://github.com/dadion123/agent-context-doctor
- npm: https://www.npmjs.com/package/agent-context-doctor
