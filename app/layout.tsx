import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modo Crucero · Demos",
  description: "Propuestas de automatización con IA para clínicas.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
