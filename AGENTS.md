# moloo editor

This repository is a moloo editor, scaffolded by `moloo editor create`.

For editor authoring, read [.agents/skills/build-moloo-editor/SKILL.md](.agents/skills/build-moloo-editor/SKILL.md).

Root `skills/<id>/SKILL.md` is for skills this editor provides to bots through
the manifest's `skills` field. It is separate from the authoring skill in `.agents/skills/`.

Install with `pnpm install`; validate with `pnpm typecheck`, `pnpm test`, and `pnpm build`.
