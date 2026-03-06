"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Package,
    FileText,
    ShoppingCart,
    BarChart2,
    UserCog,
    ChevronDown,
    ChevronRight,
    Layers,
    Wrench,
    Tag,
    BoxesIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href?: string;
    icon: React.ElementType;
    children?: NavItem[];
    roles?: string[];
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Masters",
        icon: Layers,
        children: [
            { label: "Subsidiaries", href: "/masters/subsidiaries", icon: Building2 },
            { label: "Vendors", href: "/masters/vendors", icon: Package },
            { label: "Stock Categories", href: "/masters/stock-categories", icon: Tag },
            { label: "Stock Groups", href: "/masters/stock-groups", icon: BoxesIcon },
            { label: "Manufacturers", href: "/masters/manufacturers", icon: Wrench },
            { label: "Stock Items", href: "/masters/stock-items", icon: Package },
        ],
    },
    {
        label: "Transactions",
        icon: FileText,
        children: [
            { label: "MRF", href: "/transactions/mrf", icon: FileText },
            { label: "RFQ", href: "/transactions/rfq", icon: ShoppingCart },
            { label: "Purchase Orders", href: "/transactions/po", icon: ShoppingCart },
        ],
    },
    {
        label: "Reports",
        href: "/reports",
        icon: BarChart2,
    },
    {
        label: "Users",
        href: "/users",
        icon: UserCog,
        roles: ["ADMIN"],
    },
];

interface SidebarNavItemProps {
    item: NavItem;
    depth?: number;
}

function SidebarNavItem({ item, depth = 0 }: SidebarNavItemProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(() => {
        if (item.children) {
            return item.children.some((child) => child.href && pathname.startsWith(child.href));
        }
        return false;
    });

    const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;

    if (item.children) {
        const isChildActive = item.children.some(
            (child) => child.href && (pathname === child.href || pathname.startsWith(child.href + "/"))
        );

        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        "w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                        isChildActive
                            ? "text-white bg-[#2d4a6b]"
                            : "text-[#a8b8cc] hover:bg-[#263447] hover:text-white"
                    )}
                    style={{ paddingLeft: `${16 + depth * 12}px` }}
                >
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {open && (
                    <div>
                        {item.children.map((child) => (
                            <SidebarNavItem key={child.href || child.label} item={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href!}
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                isActive
                    ? "text-white bg-[#2d4a6b] border-r-2 border-blue-400"
                    : "text-[#a8b8cc] hover:bg-[#263447] hover:text-white"
            )}
            style={{ paddingLeft: `${16 + depth * 12}px` }}
        >
            <item.icon size={15} className="flex-shrink-0" />
            <span>{item.label}</span>
        </Link>
    );
}

export function Sidebar() {
    return (
        <aside
            className="flex flex-col h-screen"
            style={{
                width: "var(--sidebar-width)",
                minWidth: "var(--sidebar-width)",
                backgroundColor: "var(--sidebar-bg)",
                borderRight: "1px solid var(--sidebar-border)",
            }}
        >
            {/* Logo / Header */}
            <div
                className="flex items-center gap-3 px-4 py-4"
                style={{ borderBottom: "1px solid var(--sidebar-border)" }}
            >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-white font-bold text-sm leading-tight">PMS</div>
                    <div className="text-[#6b8aaa] text-[10px] leading-tight">Procurement System</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2">
                {navItems.map((item) => (
                    <SidebarNavItem key={item.href || item.label} item={item} />
                ))}
            </nav>

            {/* Footer */}
            <div
                className="px-4 py-3"
                style={{ borderTop: "1px solid var(--sidebar-border)" }}
            >
                <p className="text-[10px] text-[#4a6a8a] text-center">
                    © 2026 Procurement Management
                </p>
            </div>
        </aside>
    );
}
