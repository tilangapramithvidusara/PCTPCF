/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from "lexical";
import { useLayoutEffect, useRef } from "react";
import { $generateNodesFromDOM } from "@lexical/html";

type Props = Readonly<{}>;

export const SET_HTML_COMMAND: LexicalCommand<string | null | undefined> = createCommand("SET_HTML_COMMAND");

export default function () {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    return editor.registerCommand(
      SET_HTML_COMMAND,
      (payload) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();

          if (payload == null) {
            const paragraph = $createParagraphNode();
            root.append(paragraph);
            paragraph.select();
          } else {
            const parser = new DOMParser();
            
            const dom = parser.parseFromString(payload, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);

            root.append(...nodes);
            nodes[nodes.length - 1]?.selectEnd();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
