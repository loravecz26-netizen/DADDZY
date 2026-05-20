import { UserCircle } from "lucide-react";
import { Sidebar } from "@/components/nav/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b px-6">
          {/* Replace with <UserButton afterSignOutUrl="/" /> once Clerk keys are configured */}
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
