import React from "react";
import { Button } from "antd";
import SIcon from "../SIcon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "../images/ImagesPlugin";
import { useRef } from "react";

type Props = Readonly<{
  disabled?: boolean;
}>;
export default function ({ disabled }: Props) {
  const [editor] = useLexicalComposerContext();
  const fileRef = useRef<HTMLInputElement>(null);
  console.log(fileRef);

  return (
    <>
      <Button disabled={disabled} onClick={(e) => {
        console.log("File Ref",e )
        fileRef.current?.click?.()}} size="small" icon={<SIcon>image</SIcon>} />
      <input
        ref={fileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          const reader = new FileReader();
          reader.onload = function () {
            if (typeof reader.result === "string") {
              const payload = { altText: file?.name ?? "", src: reader.result };
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
            }
            return "";
          };
          if (file != null) {
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        type="file"
        style={{ display: "none" }}
      />
    </>
  );
}
