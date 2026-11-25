import { useCallback, useSyncExternalStore } from "react";
import { observe } from "@moloodev/editor-sdk/crdt";
import { isEditorContentReady, useOpenSession } from "@moloodev/editor-sdk/view";
import { readMessage, writeMessage } from "../format/document";

export function useDocument() {
  const { doc, mode, openBrowser } = useOpenSession();
  const ready = isEditorContentReady(mode, doc !== null);
  const subscribe = useCallback((notify: () => void) =>
    ready && doc ? observe(doc, notify) : () => {}, [doc, ready]);
  const getSnapshot = useCallback(() => {
    if (!ready || !doc) return null;
    try { return readMessage(doc); } catch { return null; }
  }, [doc, ready]);
  const message = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    doc: ready && message !== null ? doc : null,
    ready,
    message,
    contentError: ready && message === null,
    editable: ready && mode === "edit" && message !== null,
    openBrowser,
    setMessage(value: string) {
      if (ready && mode === "edit" && message !== null && doc) writeMessage(doc, value);
    },
  };
}
