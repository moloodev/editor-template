import assert from "node:assert/strict";
import { test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDoc, rootMap, writeJson } from "@moloodev/editor-sdk/crdt";
import { EditorViewProvider, type EditorViewBinding } from "@moloodev/editor-sdk/view";
import manifest from "../manifest";
import { readMessage } from "../format/document";
import { useDocument } from "./use-document";

function renderDocument(session: ReturnType<EditorViewBinding["useOpenSession"]>) {
  let snapshot!: ReturnType<typeof useDocument>;
  function Probe() {
    snapshot = useDocument();
    return null;
  }
  const binding = { useOpenSession: () => session } as EditorViewBinding;
  renderToStaticMarkup(createElement(EditorViewProvider, { binding, children: createElement(Probe) }));
  return snapshot;
}

test("opens JSON template documents by shape and rejects invalid content", () => {
  const doc = createDoc();
  try {
    const payload = manifest.templates![0]!.payload;
    assert.ok(payload);
    writeJson(doc, payload);
    const session: ReturnType<EditorViewBinding["useOpenSession"]> = {
      asset: { id: "template", name: "untitled.example.json", type: "application/json" },
      doc,
      mode: "edit",
      data: null,
      syncStatus: "live",
      openBrowser() {},
      closeBrowser() {},
    };
    const valid = renderDocument(session);
    assert.equal(valid.doc, doc);
    assert.equal(valid.message, "");
    assert.equal(valid.contentError, false);
    assert.equal(valid.editable, true);
    valid.setMessage("Hello!");
    assert.equal(readMessage(doc), "Hello!");

    rootMap(doc).set("message", 42);
    const invalid = renderDocument(session);
    assert.equal(invalid.ready, true);
    assert.equal(invalid.doc, null);
    assert.equal(invalid.message, null);
    assert.equal(invalid.contentError, true);
    assert.equal(invalid.editable, false);
    invalid.setMessage("overwrite");
    assert.equal(rootMap(doc).get("message"), 42);
  } finally {
    doc.destroy();
  }
});
