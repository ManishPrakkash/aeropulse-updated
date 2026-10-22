import { Outlet } from "react-router-dom";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { ESP32ConnectionBadge } from "./esp32-connection-badge";

export function Layout() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-3">
            <ESP32ConnectionBadge />
            <UserNav />
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
