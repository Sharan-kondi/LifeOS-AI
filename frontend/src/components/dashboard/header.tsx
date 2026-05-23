"use client";

import { useState } from "react";
import { Bell, Search, User, LogOut, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const { user, logout, login } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  const demoUsers = [
    "nchahal@example.org",
    "tanveersuri@example.com",
    "siya70@example.net",
    "okhosla@example.com",
  ];

  const handleSwitchUser = async () => {
    try {
      setIsSwitching(true);
      const currentUserIndex = demoUsers.indexOf(user?.email || "");
      const nextUser = demoUsers[(currentUserIndex + 1) % demoUsers.length];
      await login(nextUser, "LifeOS@2026");
      // Optional: force reload to refresh all dashboard data
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch user", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search transactions, subscriptions..."
          className="h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSwitchUser}
          disabled={isSwitching}
          className="mr-2 hidden md:flex border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
        >
          {isSwitching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Demo: Switch User
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-border ml-2">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium leading-none">{user?.fullName || "User"}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.profession || "Member"}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
            <span className="text-xs font-bold text-white">
              {user?.fullName?.charAt(0) || <User className="h-4 w-4" />}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Log out">
            <LogOut className="h-4 w-4 text-muted-foreground hover:text-red-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
