import React from "react";
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from "@ant-design/icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "antd";
import { ElementFormatType, FORMAT_ELEMENT_COMMAND, $isElementNode } from "lexical";
import useOnLexicalEditorChange from "../hooks/useOnLexicalEditorChange";
import { useState } from "react";
import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";

import { $isAtNodeEnd } from "@lexical/selection";
import { ElementNode, RangeSelection, TextNode } from "lexical";

type Props = Readonly<{
  format: ElementFormatType;
  disabled?: boolean;
}>;

export default function ({ format, disabled }: Props) {
  let icon = null;
  switch (format) {
    case "center":
      icon = <AlignCenterOutlined rev={undefined} />;
      break;
    case "left":
      icon = <AlignLeftOutlined rev={undefined} />;
      break;
    case "right":
      icon = <AlignRightOutlined rev={undefined} />;
      break;
  }

  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);
  useOnLexicalEditorChange(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);

      const parent = node.getParent();

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      const f = $isElementNode(matchingParent)
        ? matchingParent.getFormatType()
        : $isElementNode(node)
        ? node.getFormatType()
        : parent?.getFormatType();

      if (f == null || f.length === 0) {
        //default
        setIsActive(format === "left");
      } else {
        setIsActive(format === f);
      }
    }
  }, [setIsActive, format]);

  return (
    <Button
      icon={icon}
      disabled={disabled}
      type={isActive ? "primary" : "default"}
      size="small"
      onClick={() => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
      }}
    />
  );
}

function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
