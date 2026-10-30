import { useCallback, useSyncExternalStore } from "react";
import { observe } from "@moloodev/editor-sdk/crdt";
import { isEditorContentReady, useOpenSession } from "@moloodev/editor-sdk/view";
import manifest from "../manifest";
import { readMessage, writeMessage } from "../format/document";

export function useDocument() {
  const { asset, doc, mode, openBrowser } = useOpenSession();
  const ready = isEditorContentReady(mode, doc !== null);
  const accepted = asset !== null && manifest.acceptedTypes.includes(asset.type);
  const subscribe = useCallback((notify: () => void) =>
    ready && accepted && doc ? observe(doc, notify) : () => {}, [doc, ready, accepted]);
  const getSnapshot = useCallback(() => {
    if (!ready || !accepted || !doc) return null;
    try { return readMessage(doc); } catch { return null; }
  }, [doc, ready, accepted]);
  const message = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    doc: ready && accepted && message !== null ? doc : null,
    ready,
    message,
    contentError: ready && message === null,
    editable: ready && accepted && mode === "edit" && message !== null,
    openBrowser,
    setMessage(value: string) {
      if (ready && accepted && mode === "edit" && message !== null && doc) writeMessage(doc, value);
    },
  };
}
