import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button } from "antd";
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection, TextFormatType } from "lexical";
import { useState } from "react";
import useOnLexicalEditorChange from "../hooks/useOnLexicalEditorChange";

type Props = Readonly<{
  format: TextFormatType;
  children: React.ReactNode;
  disabled?: boolean;
}>;

export default function FormatButton({ disabled, format, children }: Props) {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);

  useOnLexicalEditorChange(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsActive(selection.hasFormat(format));
    }
  }, [setIsActive, format]);

  return (
    <Button
      disabled={disabled}
      type={isActive ? "primary" : "default"}
      size="small"
      icon={children}
      onClick={() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
      }}
    />
  );
}
