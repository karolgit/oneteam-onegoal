import type { Metadata } from "next";
import { AppShell } from "./views";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oneteam-onegoal.com"),
  applicationName: "oneteam-onegoal",
  title: {
    default: "oneteam-onegoal",
    template: "%s | oneteam-onegoal"
  },
  description:
    "AI-powered meeting intelligence for shared customer context and executive-ready meeting preparation.",
  icons: {
    icon: [
      {
        url: "/oracle-logo.png",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/oracle-logo.png",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: "oneteam-onegoal",
    description:
      "AI-powered meeting intelligence for shared customer context and executive-ready meeting preparation.",
    siteName: "oneteam-onegoal",
    images: [
      {
        url: "/oracle-logo.png",
        alt: "oneteam-onegoal"
      }
    ],
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
