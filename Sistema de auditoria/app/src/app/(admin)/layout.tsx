import { AdminSidebar } from "@/components/domain/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/labels";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-[#F4F6FA]">
      <AdminSidebar userName={user.name} userRole={ROLE_LABEL[user.role]} />
      <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
