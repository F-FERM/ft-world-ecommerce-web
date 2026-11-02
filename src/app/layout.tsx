import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/common/layout/Navbar";
import Footer from "../components/common/layout/Footer";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FT-World",
  description: "FT-World",
  icons: {
    icon: "/icons/metaicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased font-sans">
        <Providers>
          <Navbar/>
          {children} <Toaster richColors />
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
