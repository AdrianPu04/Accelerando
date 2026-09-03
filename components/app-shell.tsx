"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/history", label: "History" },
] as const;

interface AppShellProps {
  children: ReactNode;
  className?: string;
  onNavigateHome?: () => void;
}

export function AppShell({ children, className, onNavigateHome }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-5 py-5 lg:px-6",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-8 border-b border-border pb-5">
        <Link
          href="/"
          onClick={onNavigateHome}
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Accelerando
        </Link>

        <nav className="flex items-baseline gap-6" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.href === "/" ? onNavigateHome : undefined}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="flex min-w-0 flex-col gap-8">{children}</div>
    </div>
  );
}
