"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, PiggyBank, ReceiptText, Cpu } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: Wallet },
  { name: "Expenses", href: "/expenses", icon: ReceiptText },
  { name: "Savings", href: "/savings", icon: PiggyBank },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 md:sticky md:top-0 md:left-0 md:h-screen md:w-24 lg:w-64 md:border-t-0 md:border-r md:bg-white/40 flex md:flex-col">
      <div className="hidden md:flex items-center gap-3 p-8 lg:p-10">
         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-white" />
         </div>
         <h1 className="hidden lg:block text-xl font-black tracking-tighter text-slate-900 uppercase">
            X-Tracker
         </h1>
      </div>
      
      <div className="flex w-full md:flex-col md:px-4 md:pb-10 md:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 group md:flex-row md:justify-center lg:justify-start md:px-4 md:py-4 lg:px-6 md:rounded-2xl transition-all duration-300 relative",
                isActive 
                  ? "text-slate-900 bg-slate-100/80 lg:bg-slate-900 lg:text-white lg:shadow-xl lg:shadow-slate-200" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-900 lg:text-white" : "text-slate-400")} />
              <span className="text-[9px] lg:text-sm font-black uppercase tracking-widest md:hidden lg:block">{link.name}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full md:hidden" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
