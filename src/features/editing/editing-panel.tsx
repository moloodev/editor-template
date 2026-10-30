import { ContentErrorNotice } from "@moloodev/editor-sdk/layout/frame";
import { useDocument } from "../../session/use-document";

export function EditingPanel() {
  const document = useDocument();
  if (document.contentError) return <ContentErrorNotice onOpenBrowser={document.openBrowser} />;
  if (!document.ready) return <p className="empty">Open or create a document to begin.</p>;
  return <label className="editing-panel">
    <span>Message</span>
    <textarea
      value={document.message ?? ""}
      readOnly={!document.editable}
      onChange={(event) => document.setMessage(event.target.value)}
      placeholder="Write a message…"
    />
  </label>;
}
