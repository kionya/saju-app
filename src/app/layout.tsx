import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

const layoutModeScript = `
(() => {
  try {
    const mode = window.localStorage.getItem('moonlight:layout-mode');
    document.documentElement.dataset.appLayout = mode === 'horizontal' ? 'horizontal' : 'vertical';
  } catch {
    document.documentElement.dataset.appLayout = 'vertical';
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "사주",
    "사주팔자",
    "사주풀이",
    "오행 분석",
    "운세",
    "명리학",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="dark h-full antialiased"
      data-app-layout="vertical"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: layoutModeScript }} />
        {children}
      </body>
    </html>
  );
}
