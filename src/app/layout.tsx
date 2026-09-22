import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { PROJECT_NAME } from "@/lib/config";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "900"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Cockpit Starter", template: "%s · Cockpit Starter" },
  description: "A small command board for an AI-assisted project team.",
};

// Applies the remembered theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem("cockpit-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Shell projectName={PROJECT_NAME}>{children}</Shell>
      </body>
    </html>
  );
}
