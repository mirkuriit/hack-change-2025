import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const proximanova = localFont({
  src: [
    {
      path: "../../public/fonts/ProximaNova-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ProximaNova-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Анализ Москвы",
  description: "Приложение для анализа отзывов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={proximanova.className}>{children}</body>
    </html>
  );
}
