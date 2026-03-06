import { Sidebar } from "@/components/layout/Sidebar";

// Auth is handled entirely by proxy.ts Edge middleware (getToken).
// No need to call auth() here — if the request reached this layout, the user is authenticated.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "#f0f2f5" }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
