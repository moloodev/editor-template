import { defineEditorManifest } from "@moloodev/editor-sdk/view";

// Scaffold tokens: example.editor, /editor/example, .example.json, and the schema URI.
export default defineEditorManifest({
  id: "example.editor",
  title: "Example editor",
  description: "A minimal collaborative JSON editor",
  path: "/editor/example",
  acceptedTypes: ["example.editor"],
  icon: "tabler:file-text",
  fileTypes: [{
    extensions: [".example.json"],
    mimeTypes: ["application/json"],
    schema: "https://example.com/schemas/example/v1.json",
    storageMode: "json",
    label: "Example",
    icon: "tabler:file-text",
    color: "#5b6abf",
  }],
  templates: [{
    id: "blank",
    label: "Blank document",
    description: "Start with an empty message",
    type: "example.editor",
    defaultName: "untitled.example.json",
    storageMode: "json",
    contentType: "application/json",
    schema: "https://example.com/schemas/example/v1.json",
    payload: { version: 1, message: "" },
  }],
  layoutVersion: 1,
});
