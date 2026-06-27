# Competitive Landscape

This note summarizes the attached Deep Research results used to start Agent Context Doctor.

## Key Observation

Several tools already generate `AGENTS.md` or adjacent agent context files. Fewer tools focus on cross-file diagnosis, drift detection, safe patch planning, and Japanese-first maintainer workflows.

## Reference Projects

- `0xmariowu/AgentLint`
- `samilozturk/agentlint`
- `mauhpr/agentlint`
- `markoblogo/AGENTS.md_generator`
- `avinshe/agentseed`
- `eugeniughelbur/agents-md`
- `nyosegawa/agents-md-generator`
- `kinopeee/cursorrules`

## Differentiation

Agent Context Doctor should avoid positioning competitors as wrong. The sharper positioning is:

- Japanese-first diagnostics
- doctor-first rather than generator-first
- safe patch plan before writes
- README / package scripts / `.env.example` / `.gitignore` boundary checks
- maintainer workflow evidence for PR review, issue triage, and releases
- CI-friendly JSON output

## Watch Areas

- AgentLint-style fix plans and GitHub Actions
- generator tools adding more doctor features
- Cursor rules repositories adding cross-agent guidance
- Japanese articles becoming reusable rules or presets
