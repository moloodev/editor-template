import { rootMap, transact, type Doc } from "@moloodev/editor-sdk/crdt";

export function readMessage(doc: Doc): string {
  const root = rootMap(doc);
  const message = root.get("message");
  if (root.get("version") !== 1 || typeof message !== "string") {
    throw new Error("Expected a version 1 document with a message string");
  }
  return message;
}

export function writeMessage(doc: Doc, message: string): void {
  readMessage(doc);
  transact(doc, () => rootMap(doc).set("message", message));
}
