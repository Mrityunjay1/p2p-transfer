"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const selected = pathname === href;

  return (
    <div
      className={`
      flex items-center w-full p-2 mb-2 rounded-lg transition-all duration-200 ease-in-out
      ${
        selected
          ? "bg-purple-100 text-purple-700"
          : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"
      }
      cursor-pointer
      sm:pl-4 md:pl-6 lg:pl-8
    `}
      onClick={() => router.push(href)}
    >
      <div className="flex-shrink-0 mr-3 text-xl sm:text-2xl">{icon}</div>
      <div
        className={`
      font-medium text-sm sm:text-base
      ${selected ? "text-purple-700" : "text-slate-500"}
    `}
      >
        {title}
      </div>
    </div>
  );
};
