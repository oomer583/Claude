import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./styles.css";

export const metadata: Metadata = {
  title: "Açık Alan — AI çalışma alanı",
  description: "Sohbetlerinizi, projelerinizi ve üretimlerinizi tek bir çalışma alanında buluşturun."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
