# moloo editor

This repository is a moloo editor, scaffolded by `moloo editor create`.

For editor authoring, read [.agents/skills/build-moloo-editor/SKILL.md](.agents/skills/build-moloo-editor/SKILL.md).
The guide targets the npm `@moloodev/*` 0.13.0 CLI and SDK; check the installed
version before using its commands and APIs.

Root `skills/<id>/SKILL.md` is the convention for bot-facing editor skills,
separate from the authoring skill in `.agents/skills/`. The 0.13.0 SDK accepts
the manifest's `skills` folder path, and the CLI validates and uploads those
files during publication.

Install with `pnpm install`; validate with `pnpm typecheck`, `pnpm test`, and `pnpm build`.
