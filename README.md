# Example editor

Minimal standalone moloo editor: one JSON document, one message field, session sync and undo.
Requires Node 24 and pnpm 10.32.1.

```sh
pnpm dlx @moloodev/cli editor create acme.notes
cd notes-editor
pnpm install
pnpm exec moloo login
pnpm dev
```

The view server uses port **4310**. Open your workspace on https://app.moloo.dev,
choose **로컬 뷰 연결**, and allow local network access. The view runs inside the
host iframe; visiting the view URL directly does not open a standalone app.

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm publish:editor --workspace your-workspace
pnpm status --workspace your-workspace
```

Your workspace must manage the publisher handle. Publishing may require platform review.
To use an already empty directory, run `moloo editor create acme.notes --here` there.

The create command rewrites the placeholder package name, editor id, route,
file extension, title, and schema path. Replace the illustrative `example.com` schema URI
with one you own before publishing; customize the manifest, format, and editing panel.
Do not publish the unchanged placeholder editor.
