// app/layout.tsx
import "./globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "App Indecisos",
  description: "Decida com IA!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={nunito.variable}>
      <body className="font-nunito">{children}</body>
    </html>
  );
}
