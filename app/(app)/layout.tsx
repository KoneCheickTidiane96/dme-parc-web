"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle, Zap, MapPin } from "lucide-react";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { navSections, type NavItem } from "@/lib/nav";
import { ElectricPatternBackground } from "@/components/electric-pattern-bg";

interface Site {
  id_site: number;
  libelle_site: string;
}

// Retrouve l'element du menu correspondant a l'adresse de la page
function trouverElementMenu(pathname: string): NavItem | undefined {
  for (const section of navSections) {
    const item = section.items.find((i) => pathname.startsWith(i.href));
    if (item) return item;
  }
  return undefined;
}

function pageTitle(pathname: string): string {
  const item = trouverElementMenu(pathname);
  if (item) return item.label;
  if (pathname.startsWith("/materiels/")) return "Fiche materiel";
  return "Parc informatique DME";
}

function initials(identifiant: string): string {
  return identifiant.slice(0, 2).toUpperCase();
}

// Badge (ou menu pour l'administrateur) qui indique le site consulte
function SelecteurSite() {
  const { user, siteActif, changerSiteActif } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sites`)
      .then((res) => res.json())
      .then(setSites)
      .catch(() => setSites([]));
  }, []);

  // Choisit automatiquement le premier site si l'administrateur n'en a
  // encore choisi aucun. Le changement d'etat est repousse hors de
  // l'execution synchrone de l'effect (queueMicrotask), ce qui evite
  // l'avertissement/erreur "setState synchronously within an effect".
  useEffect(() => {
    if (user?.profil === "administrateur" && !siteActif && sites.length > 0) {
      queueMicrotask(() => changerSiteActif(String(sites[0].id_site)));
    }
  }, [user, siteActif, sites, changerSiteActif]);

  if (!user) return null;

  const nomSiteActif = sites.find((s) => String(s.id_site) === siteActif)?.libelle_site;

  if (user.profil !== "administrateur") {
    return nomSiteActif ? (
      <Badge variant="secondary" className="hidden items-center gap-1 sm:inline-flex">
        <MapPin className="size-3" />
        {nomSiteActif}
      </Badge>
    ) : null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button>
            <Badge variant="secondary" className="hidden cursor-pointer items-center gap-1 sm:inline-flex">
              <MapPin className="size-3" />
              {nomSiteActif ?? "Choisir un site"}
            </Badge>
          </button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Site consulté</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sites.map((s) => (
            <DropdownMenuItem key={s.id_site} onClick={() => changerSiteActif(String(s.id_site))}>
              <MapPin />
              {s.libelle_site}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, pret } = useAuth();

  // Redirige vers la connexion si personne n'est connecte, et vers le
  // tableau de bord si le profil n'a pas le droit d'ouvrir cette page
  useEffect(() => {
    if (!pret) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const item = trouverElementMenu(pathname);
    if (item && !item.profils.includes(user.profil)) {
      router.push("/dashboard");
    }
  }, [pret, user, pathname, router]);

  function handleDeconnexion() {
    logout();
    router.push("/login");
  }

  if (!pret || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

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
              <span className="text-xs text-sidebar-foreground/60">DME - CIE</span>
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
              <DropdownMenuGroup>
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleDeconnexion}>
                  <LogOut />
                  Se deconnecter
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="relative">
        <ElectricPatternBackground />
        <header className="relative z-10 flex h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-medium">{pageTitle(pathname)}</h1>
          <div className="ml-auto flex items-center gap-2">
            <SelecteurSite />
            <ThemeToggle />
          </div>
        </header>
        <main className="relative z-10 flex-1 bg-muted/30 p-6">{children}</main>
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