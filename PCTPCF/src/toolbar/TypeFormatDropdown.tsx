import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Select } from "antd";
import { $getSelection, $isRangeSelection, $createParagraphNode } from "lexical";
import { ReactNode, useState } from "react";
import { HeadingTagType, $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import SIcon from "../SIcon";
import { $wrapNodes } from "@lexical/selection";
import useOnLexicalEditorChange from "../hooks/useOnLexicalEditorChange";

type Props = Readonly<{
  disabled?: boolean;
}>;

type TypeFormat = Readonly<{
  format: HeadingTagType | "paragraph";
  label: ReactNode;
}>;

const TYPE_FORMATS: ReadonlyArray<TypeFormat> = [
  {
    format: "h1",
    label: (
      <>
        <SIcon>type-h1</SIcon> Heading 1
      </>
    ),
  },
  {
    format: "h2",
    label: (
      <>
        <SIcon>type-h2</SIcon> Heading 2
      </>
    ),
  },
  {
    format: "h3",
    label: (
      <>
        <SIcon>type-h3</SIcon> Heading 3
      </>
    ),
  },
  {
    format: "paragraph",
    label: (
      <>
        <SIcon>type</SIcon> Normal
      </>
    ),
  },
];

export default function TypeFormatDropdown({ disabled }: Props) {
  const [editor] = useLexicalComposerContext();
  const [typeFormat, setTypeFormat] = useState<TypeFormat["format"]>("paragraph");

  useOnLexicalEditorChange(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        const type = $isHeadingNode(element) ? element.getTag() : "paragraph";
        //@ts-ignore
        setTypeFormat(type);
      }
    }
  }, [setTypeFormat]);

  return (
    <Select
      disabled={disabled}
      style={{ minWidth: 150 }}
      value={typeFormat}
      size="small"
      onChange={(x) => {
        setTypeFormat(x);

        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            $wrapNodes(selection, () => {
              if (x === "paragraph") {
                return $createParagraphNode();
              } else {
                return $createHeadingNode(x);
              }
            });
          }
        });
      }}
      options={TYPE_FORMATS.map((x) => {
        return {
          label: x.label,
          value: x.format,
        };
      })}
      suffixIcon={<SIcon>chevron-down</SIcon>}
    />
  );
}
