# moloo editor

This repository is a moloo editor, scaffolded by `moloo editor create`.

For editor authoring, read [.agents/skills/build-moloo-editor/SKILL.md](.agents/skills/build-moloo-editor/SKILL.md).
The guide targets the npm `@moloodev/*` 0.12.0 CLI and SDK; check the installed
version before using its commands and APIs.

Root `skills/<id>/SKILL.md` is the convention for bot-facing editor skills,
separate from the authoring skill in `.agents/skills/`. The 0.12.0 SDK accepts
the manifest's `skills` folder path, but that CLI does not collect or upload
skill files; declaring the field does not publish them.

Install with `pnpm install`; validate with `pnpm typecheck`, `pnpm test`, and `pnpm build`.
