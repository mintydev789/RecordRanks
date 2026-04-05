import "bootstrap/dist/css/bootstrap.css";
import "~/app/globals.css";
import { Quicksand, Roboto } from "next/font/google";
import Providers from "~/app/components/Providers.tsx";
// Prevent server-side rendering bug with FA icons, where the icons flash as very large before full page load
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent FA from adding its CSS since we did it manually above
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const quicksand = Quicksand();
const roboto = Roboto();

export const metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    default: process.env.NEXT_PUBLIC_PROJECT_NAME,
  },
  description: process.env.METADATA_DESCRIPTION,
  keywords: process.env.METADATA_KEYWORDS,
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BUCKET_BASE_URL}/assets/screenshots/contest_results.jpg`],
  },
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${quicksand.className} ${roboto.className}`}>
      <Providers>{children}</Providers>
    </html>
  );
}
