import assert from "node:assert/strict";
import { test } from "node:test";
import { createDoc, createUndo, rootMap, writeJson } from "@moloodev/editor-sdk/crdt";
import manifest from "../manifest";
import { readMessage, writeMessage } from "./document";

test("edits the template document in place, preserves other fields, and supports undo", () => {
  const doc = createDoc();
  try {
    writeJson(doc, { ...manifest.templates![0]!.payload, extra: "preserved" });
    const undo = createUndo(doc);
    writeMessage(doc, "Hello!");
    assert.equal(readMessage(doc), "Hello!");
    assert.equal(rootMap(doc).get("extra"), "preserved");
    undo.undo();
    assert.equal(readMessage(doc), "");
    rootMap(doc).set("message", 42);
    assert.throws(() => readMessage(doc), /message string/);
    assert.throws(() => writeMessage(doc, "overwrite"), /message string/);
  } finally {
    doc.destroy();
  }
});
