"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/history", label: "History" },
] as const;

interface AppShellProps {
  children: ReactNode;
  /** Optional eyebrow above the page title area when pages don't supply their own. */
  className?: string;
  /** Pause handlers etc. when leaving listen via brand link. */
  onNavigateHome?: () => void;
}

export function AppShell({ children, className, onNavigateHome }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-8 px-8 py-8",
        className,
      )}
    >
      <header className="flex items-end justify-between gap-8 border-b border-border pb-4">
        <Link
          href="/"
          onClick={onNavigateHome}
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Accelerando
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
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
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
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
