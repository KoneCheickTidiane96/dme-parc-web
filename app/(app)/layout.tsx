"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserCircle, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth";
import { navSections } from "@/lib/nav";

function pageTitle(pathname: string): string {
  for (const section of navSections) {
    const item = section.items.find((i) => pathname.startsWith(i.href));
    if (item) return item.label;
  }
  if (pathname.startsWith("/materiels/")) return "Fiche materiel";
  return "Parc informatique DME";
}

function initials(identifiant: string): string {
  return identifiant.slice(0, 2).toUpperCase();
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar className="border-none">
        <SidebarHeader className="gap-3 px-3 py-4">
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Zap className="size-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Parc informatique
              </span>
              <span className="text-xs text-sidebar-foreground/60">DME — CIE</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-4">
          {navSections.map((section) => {
            const items = section.items.filter(
              (item) => !user || item.profils.includes(user.profil)
            );
            if (items.length === 0) return null;
            return (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            render={
                              <Link href={item.href}>
                                <Icon />
                                <span>{item.label}</span>
                              </Link>
                            }
                          />
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarFooter className="px-3 pb-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {user ? initials(user.identifiant) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">
                      {user ? user.identifiant : "Non connecte"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60 capitalize">
                      {user ? user.profil : "session non initialisee"}
                    </span>
                  </div>
                </button>
              }
            />
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Se deconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-medium">{pageTitle(pathname)}</h1>
          <div className="ml-auto flex items-center gap-2">
            {user?.id_site && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.id_site}
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
