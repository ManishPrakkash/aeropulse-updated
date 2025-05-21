import React from "react";
import { Link, NavLink } from "react-router-dom";

import { cn } from "../lib/utils";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link to="/" className="text-xl font-medium transition-colors hover:text-primary flex items-center">
        Aeropulse
      </Link>
      <div className="flex items-center space-x-4 ml-10">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn("text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground")
          }
          end
        >
          Monitor
        </NavLink>
        <NavLink
          to="/patient"
          className={({ isActive }) =>
            cn("text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground")
          }
        >
          Patient
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            cn("text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground")
          }
        >
          History
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn("text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground")
          }
        >
          Settings
        </NavLink>
      </div>
    </nav>
  );
}
