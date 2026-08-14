import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset.ZIP",
  description: "우리 가족 공동자산 장부",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Asset.ZIP",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff385c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col text-ink antialiased">
        {children}
        <footer className="py-4 text-center text-[11px] text-muted">
          © ChangHuwon All Rights Reserved
        </footer>
      </body>
    </html>
  );
}
