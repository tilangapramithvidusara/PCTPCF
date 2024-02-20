import { css } from "@emotion/css";

export const EDITOR_STYLES = css({
  ".editor-image": {
    img: {
      maxWidth: "100%",
      cursor: "default",
      "&.focused": {
        outline: "2px solid rgb(60, 132, 244)",
        userSelect: "none",
      },
      "&.draggable": {
        cursor: "grab",

        "&:active": {
          cursor: "grabbing",
        },
      },
    },
  },
  ".image-resizer": {
    display: "block",
    width: 7,
    height: 7,
    position: "absolute",
    backgroundColor: "rgb(60, 132, 244)",
    border: "1px solid #fff",
    "&.image-resizer-n": {
      top: -3,
      left: "48%",
      cursor: "n-resize",
    },
    "&.image-resizer-ne": {
      top: -3,
      right: -3,
      cursor: "ne-resize",
    },
    "&.image-resizer-e": {
      bottom: "48%",
      right: -3,
      cursor: "e-resize",
    },
    "&.image-resizer-se": {
      bottom: -3,
      right: -3,
      cursor: "nwse-resize",
    },
    "&.image-resizer-s": {
      bottom: -3,
      left: "48%",
      cursor: "s-resize",
    },
    "&.image-resizer-sw": {
      bottom: -3,
      left: -3,
      cursor: "sw-resize",
    },
    "&.image-resizer-w": {
      bottom: "48%",
      left: -3,
      cursor: "w-resize",
    },
    "&.image-resizer-nw": {
      top: -3,
      left: -3,
      cursor: "nw-resize",
    },
  },
});

export const DISPLAY_STYLES = css({
  ".editor-text-underline": {
    textDecoration: "underline",
  },
  ".editor-text-strikethrough": {
    textDecoration: "line-through",
  },
  ".editor-text-underlineStrikethrough": {
    textDecoration: "underline line-through",
  },
  ".editor-text-bold": {
    fontWeight: "bold",
  },
  ".editor-text-italic": {
    fontStyle: "italic",
  },
  ".editor-image": {
    cursor: "default",
    display: "inline-block",
    position: "relative",
    userSelect: "none",
  },
  blockquote: {
    marginLeft: "1rem",
    borderLeft: "2px solid lightgrey",
    paddingLeft: "0.5rem",
  },
  outline: "none",
  p: {
    margin: 0,
  },
});
