import "./globals.css";
import { CronBoyProvider } from "@/context/CronBoyContext";
import AppShell from "@/components/common/AppShell";

export const metadata = {
  title: "Cron Boy — Subdomain Health & Cron Orchestrator",
  description: "A developer-facing dashboard for monitoring subdomain health and orchestrating cron jobs. Quiet infrastructure, sharp visibility.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CronBoyProvider>
          <AppShell>{children}</AppShell>
        </CronBoyProvider>
      </body>
    </html>
  );
}
