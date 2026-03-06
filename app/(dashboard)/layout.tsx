import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "#f0f2f5" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
