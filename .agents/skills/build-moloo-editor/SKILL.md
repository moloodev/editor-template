---
name: build-moloo-editor
description: Build or update a moloo editor from this template using the npm editor SDK, session documents, commands, and frame layout. Use for editor authoring, including preparing manifest metadata and bot-facing skills for publication.
---

# Build a moloo editor

Work in the generated editor package. Read [README.md](../../../README.md) for
requirements, scaffolding, installation, login, development, and publication
commands. Keep that setup guidance there rather than duplicating it.

## Development and publication

The workflow is `moloo editor create <publisher>.<name>` → enter the generated
directory → `pnpm install` → `moloo login` → `moloo workspace use <slug>` →
`moloo editor dev` → validation/build → `moloo editor publish`.
Use `pnpm exec moloo` for the installed CLI; `pnpm dev`, `pnpm build`,
`pnpm publish:editor`, and `pnpm status` map to the package scripts in the README.
Select the workspace after login with `pnpm exec moloo workspace use <slug>`;
an explicit `--workspace <slug>` selects it for dev or publish instead.

Inspect `package.json`, the lockfile, and the installed packages' `exports` and
source before choosing an API. The template currently locks `@moloodev/*` to
0.5.0; that CLI has dev/build/publish, but lacks create/status, and that SDK
does not type the manifest's `skills` field. Scaffolding uses a CLI with create
support, as in the README. Check the installed version before using newer
commands or fields; do not bypass types or change dependencies outside the task.

Develop inside the production host at `https://app.moloo.dev`; the CLI opens the
selected workspace's dev editor. Local connection, browser permissions, port
4310, and the iframe-only view are described in the README. There is no local
app host to start in this package.

Before publishing, run `pnpm typecheck`, `pnpm test`, and `pnpm build`, and verify
the requested interaction in the host iframe. Publish only when the user has
authorized publication, using a workspace that manages the publisher handle.
Use `moloo editor status` with a supporting CLI to inspect submitted revisions
and review findings. A successful submission may still require platform review.

## Source and manifest

Start from the existing files rather than adding a parallel editor framework:

- [src/manifest.ts](../../../src/manifest.ts): static editor metadata, file
  matching, initial templates, capabilities, and contributions.
- [src/view.tsx](../../../src/view.tsx): layout binding, chrome, providers,
  command context, undo bridge, and `mountEditorView`.
- [src/format/document.ts](../../../src/format/document.ts): document validation
  and CRDT mutations; its adjacent test covers preservation of fields and undo.
- [src/session/use-document.ts](../../../src/session/use-document.ts): session
  readiness, accepted asset type, projection, subscription, and edit guards.
- [src/features/editing/editing-panel.tsx](../../../src/features/editing/editing-panel.tsx):
  panel UI and content-error/empty/read-only behavior.

Keep package exports `./manifest` → `./src/manifest.ts` and `./view` →
`./src/view.tsx`. The view entry is executable and calls `mountEditorView`.
The manifest must remain `export default defineEditorManifest({ ... })`, with
`defineEditorManifest` imported from `@moloodev/editor-sdk/view` as in the template.
The CLI reads static literal data without executing the module: no computed
values, spreads, helper calls, extra declarations, or other imports.

Keep `id` in `<publisher>.<name>` form, and keep `path`, `acceptedTypes`,
`fileTypes`, templates, and the format reader consistent. See the README for
scaffold replacements and the placeholder schema URI that must be customized.
File rules describe extensions, MIME types, schema URI, storage mode, label,
`tabler:<name>` icon, and color. Templates describe `id`, `label`, `description`,
`type`, `defaultName`, storage mode, content type, schema, and initial payload.
Make the payload readable by the format before exposing a new template.

Put command, menu, keybinding, and configuration declarations under
`contributes`. Declare `capabilities: ["import", "download"]` only for the I/O
actually implemented, selecting the needed entries. Use a positive integer
`layoutVersion` when versioning persisted layout. `network`, when needed,
declares permitted HTTPS origins; omission permits none. Check the installed
manifest types and validation before adding optional fields.

## Isolation and view composition

The host loads the view in a sandboxed iframe on a separate origin. The view
receives no authentication tokens. Host communication is exclusively the SDK
protocol: an origin-qualified `postMessage` handshake followed by MessagePort
messages. Do not reach into the parent's DOM, use host cookies or storage, fetch
authenticated host APIs directly, or import host/server modules or
`@moloodev/asset-client` into the view. Use the public SDK entrypoints.

Preserve the composition in `src/view.tsx`:

1. `createEditorChrome(manifest, layout)` returns the local `contribution` and
   `chromeManifest`.
2. `PortEditorView` → `PortCommandsProvider` → `ScopeProvider` bind the session
   and commands. Pass the contribution to the command providers.
3. `mountEditorView({ manifest, layout, Root })` connects the view, binds theme,
   mounts React, and submits chrome after the handshake. A direct view URL
   without the parent parameter stays inert.

The host renders outer chrome, including its menubar, from the submitted
manifest; do not recreate the app shell in the iframe. The iframe renders its
panel contents and frame layout. For host operations use typed `view.call`
methods such as `"host.pick"`, `"host.render"`, `"host.download"`, and
`"asset.read"`; handle unsuccessful responses. React bindings such as
`useOpenSession` and `useEditorHost` come from `@moloodev/editor-sdk/view`.

## Documents, commands, and layout

Treat the document returned by `useOpenSession()` as authoritative. Follow
`useDocument`: gate on `isEditorContentReady(mode, doc !== null)` and the
manifest's accepted asset types before subscribing or projecting; mutate only
in edit mode. Validate the format, show `ContentErrorNotice` for unreadable
content, and keep empty/loading/read-only states usable. Never initialize over
an unreadable document or project an unrelated asset type.

Implement edits in `src/format/` with public `@moloodev/editor-sdk/crdt` APIs,
as `writeMessage` uses `transact` and `rootMap`. Preserve unrelated fields and
edit the existing document in place. Use `observe` for subscriptions and keep
the snapshot returned to `useSyncExternalStore` stable between changes.
`DocUndoBridge` from `@moloodev/editor-sdk/layout/frame` connects local document
edits to the command scope's undo/redo; keep it bound to the current session document
and avoid a second undo stack or persisted copy of document state.

Declare feature commands in the manifest with editor-prefixed IDs; shared
commands use `editor.*`. Register handlers through `useScope().registerHandler`
in an effect and return its cleanup. Mount feature command handlers for the
view lifetime so hiding a panel does not remove its commands. Guard edits in
handlers and keep `when` conditions and command context current. Follow
`src/view.tsx` to set/clear context, derive `commandLayoutState`, and send each
state through `view.sendCommandState` so host chrome reflects availability.

Use `defineLayoutSpec` and `defineEditorLayout(spec, { panels, titles,
panelHeaders })` from `@moloodev/editor-sdk/layout/frame`. Every panel content ID
needs a stable component with no required props and a title; extra binding keys
fail typecheck. Keep `FrameLayoutBinding` around `<EditorLayout binding={layout} />`.
The shared frame supplies panel headers, hide menus, docking, and command actions;
declare toolbars in the spec. If adding persistence, `useHostLayout(view)` loads
and saves host layout values; convert with `applyLayoutValues` and
`layoutValuesOf`, supplying `initialSpec` and `onSpecChange` to `EditorLayout`.
Keep panel state out of the URL and document payload.

## Skills this editor provides to bots

Authoring instructions belong in `.agents/skills/`. Bot-facing skills belong in
root `skills/<id>/SKILL.md` and describe how to work with this editor's documents,
not how to develop the editor. Never point the manifest at `.agents/skills/`.

For an editor that provides skills:

- Set the manifest's top-level `skills: "./skills"`. It is a package-relative
  folder beginning with `./`, with no backslashes, empty segments, `.` or `..`.
- Use IDs matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`, at most 64 characters. Each
  directory needs `SKILL.md` with non-empty frontmatter `name` and `description`.
- Include only UTF-8 `.md`, `.txt`, or `.json` files. Helpers may sit beside
  `SKILL.md` or in one subdirectory, such as `skills/<id>/examples/sample.json`.
  Do not include executables, shebangs, symlinks, or paths escaping the folder.
- The skills publishing flow validates and uploads the declared folder and
  generates the revision's `index.json`; do not hand-maintain that index.
  Manifest field support alone is insufficient: confirm that the installed CLI
  also uploads skill files before publishing them. The locked 0.5.0
  packages do not support this flow. Keep dependency upgrades in the scope of
  the user's request rather than hiding incompatibility with a type assertion.

Do not add a manifest `skills` entry merely to distribute this authoring skill.
It ships with the scaffold through the template's `.agents/skills/` directory.
