import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { useEffect } from "react";
import { mergeRegister } from "@lexical/utils";

export default function useOnLexicalEditorChange(callback: () => void, dependencies: ReadonlyArray<unknown>) {
  const [editor] = useLexicalComposerContext();
  return useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          callback();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          callback();
          return false;
        },
        1 //LowPriority
      )
    );
  }, [editor, ...dependencies]);
}
