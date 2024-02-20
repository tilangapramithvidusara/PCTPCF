import React from "react";
import { Tooltip } from "antd";
import { CSSProperties, ReactElement } from "react";
import { ButtonProps } from "react-bootstrap";
import { Trans } from "react-i18next";

export type Props = Readonly<{
  children: string;
  style?: CSSProperties;
  tooltip?: string | ReactElement<typeof Trans>;
  size?: ButtonProps["size"];
  color?: "primary";
}>;

export default function ({ children, style, tooltip, size, color }: Props) {
  const icon = (
    <i
      style={style}
      className={`bi bi-${children} ${size == "lg" && "fs-5"} ${color === "primary" && "text-primary"}`}
    ></i>
  );

  return tooltip == null ? icon : <Tooltip title={tooltip}>{icon}</Tooltip>;
}
