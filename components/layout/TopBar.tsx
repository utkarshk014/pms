"use client";

import { signOut } from "next-auth/react";
import { LogOut, User, Bell } from "lucide-react";

interface TopBarProps {
    title: string;
    breadcrumb?: string[];
    userName?: string;
    userRole?: string;
}

export function TopBar({ title, breadcrumb, userName, userRole }: TopBarProps) {
    return (
        <div className="page-header sticky top-0 z-10">
            <div>
                <h1 className="page-title">{title}</h1>
                {breadcrumb && (
                    <div className="breadcrumb">
                        <span>Home</span>
                        {breadcrumb.map((crumb, i) => (
                            <span key={i}>
                                <span> / </span>
                                {crumb}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <Bell size={16} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={13} className="text-white" />
                    </div>
                    <div className="leading-tight">
                        <div className="font-semibold text-gray-800 text-xs">{userName || "Admin"}</div>
                        <div className="text-[10px] text-gray-500">{userRole || "ADMIN"}</div>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                    title="Sign out"
                >
                    <LogOut size={14} />
                </button>
            </div>
        </div>
    );
}
