import { DISPLAY_STYLES } from "./RichTextStyles";
import React = require("react");

type Props = Readonly<{
  value: string;
}>;

export default function RichTextDisplay({ value }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: value }} className={DISPLAY_STYLES} />;
}
