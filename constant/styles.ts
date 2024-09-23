import { CSSProperties } from "react";

export const CENTER_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100%",
};

export const SCROLL_STYLE: CSSProperties = {
  width: "100%",
  height: "100vh",
  overflowY: "scroll",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export const COL_SCROLL_STYLE: CSSProperties = {
  ...SCROLL_STYLE,
  padding: "20px",
};

export const PRO_FORM_PROPS: any = {
  layout: "vertical",
  scrollToFirstError: {
    behavior: "smooth",
    block: "center",
  },
};
