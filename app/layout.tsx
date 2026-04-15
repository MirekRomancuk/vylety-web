import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tipy na výlety Polička a okolí",
  description:
    "Přehled zajímavých míst, tras a tipů na výlety v okolí Poličky.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}