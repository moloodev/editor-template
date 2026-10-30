import { useEffect } from "react";
import { ScopeProvider, useCommands } from "@moloodev/editor-sdk/commands";
import {
  createEditorChrome, mountEditorView, PortCommandsProvider, PortEditorView,
  type EditorView,
} from "@moloodev/editor-sdk/view";
import {
  commandLayoutState, defineEditorLayout, defineLayoutSpec, DocUndoBridge,
  EditorLayout, FrameLayoutBinding,
} from "@moloodev/editor-sdk/layout/frame";
import manifest from "./manifest";
import { EditingPanel } from "./features/editing/editing-panel";
import { useDocument } from "./session/use-document";

const spec = defineLayoutSpec({
  root: "main",
  elements: {
    main: { type: "PanelGroup", props: { id: "main", layout: "split", orientation: "vertical" }, children: ["message"] },
    message: { type: "Panel", props: { id: "message", contentId: "message" }, children: [] },
  },
});
const layout = defineEditorLayout(spec, {
  panels: { message: EditingPanel },
  titles: { message: "Message" },
});
const { contribution, chromeManifest } = createEditorChrome(manifest, layout);
const manifests = [contribution];
const icons = {};

function Content({ view }: { view: EditorView }) {
  const document = useDocument();
  const { setContext, clearContext, getUndoStack, getContext } = useCommands();
  const undo = getUndoStack(manifest.id);
  const canUndo = undo.canUndo();
  const canRedo = undo.canRedo();
  useEffect(() => {
    const context = {
      editorMode: document.editable ? "edit" : "read",
      editorHasAsset: document.doc !== null,
      editorCanUndo: document.editable && canUndo,
      editorCanRedo: document.editable && canRedo,
    };
    setContext(context);
    return () => clearContext(Object.keys(context));
  }, [document.editable, document.doc, canUndo, canRedo, setContext, clearContext]);
  const states = commandLayoutState(chromeManifest.contributes?.commands ?? [], getContext());
  useEffect(() => {
    for (const [id, state] of Object.entries(states.commands)) view.sendCommandState({ id, ...state });
  }, [view, states]);
  return <>
    <DocUndoBridge doc={document.doc} />
    <FrameLayoutBinding icons={icons}>
      <EditorLayout binding={layout} />
    </FrameLayoutBinding>
  </>;
}

function Root({ view }: { view: EditorView }) {
  return <PortEditorView view={view} acceptedTypes={manifest.acceptedTypes}>
    <PortCommandsProvider view={view} manifests={manifests}>
      <ScopeProvider manifest={contribution}><Content view={view} /></ScopeProvider>
    </PortCommandsProvider>
  </PortEditorView>;
}

mountEditorView({ manifest, layout, Root });
