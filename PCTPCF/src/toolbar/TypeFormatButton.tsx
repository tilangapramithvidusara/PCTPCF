import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "antd";
import { $getSelection, $isRangeSelection, $createParagraphNode } from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { useState } from "react";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $isHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import never from "../utils/never";
import useOnLexicalEditorChange from "../hooks/useOnLexicalEditorChange";

export enum TypeFormat {
  Quote = "quote",
  UnorderedList = "ul",
  OrderedList = "ol",
}

type Props = Readonly<{
  children: React.ReactNode;
  format: TypeFormat;
  disabled?: boolean;
}>;

export default function TypeFormatButton({ children, format, disabled }: Props) {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);

  useOnLexicalEditorChange(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const listType = parentList ? parentList.getTag() : element.getTag();
          setIsActive(listType === format);
        } else {
          setIsActive(type === format);
        }
      }
    }
  }, [setIsActive, format]);

  return (
    <Button
      type={isActive ? "primary" : "default"}
      size="small"
      icon={children}
      disabled={disabled}
      onClick={() => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            switch (format) {
              case TypeFormat.Quote:
                $wrapNodes(selection, () => (isActive ? $createParagraphNode() : $createQuoteNode()));
                break;
              case TypeFormat.OrderedList:
                if (isActive) {
                  //@ts-ignore
                  editor.dispatchCommand(REMOVE_LIST_COMMAND);
                } else {
                  //@ts-ignore
                  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
                }
                break;

              case TypeFormat.UnorderedList:
                if (isActive) {
                  //@ts-ignore
                  editor.dispatchCommand(REMOVE_LIST_COMMAND);
                } else {
                  //@ts-ignore
                  editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
                }
                break;

              default:
                never(format); // intentionally unreachable
            }
          }
        });
      }}
    />
  );
}
