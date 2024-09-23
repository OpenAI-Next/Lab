import { type Metadata } from "next";
import React, { CSSProperties } from "react";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/constant";
import { AntdRegistry } from "@ant-design/nextjs-registry";

//网页标签页信息
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  appleWebApp: {
    title: SITE_TITLE,
    statusBarStyle: "default",
  },
};

const bodyStyle: CSSProperties = {
  overflow: "hidden",
};

const htmlStyle: CSSProperties = {
  height: "100vh",
  // fontFamily: "Noto Sans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={htmlStyle}>
      <head>
        <title>{SITE_TITLE}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body style={bodyStyle}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
