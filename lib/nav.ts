import {
  LayoutDashboard,
  Laptop,
  RefreshCcw,
  Users,
  ListTree,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { ProfilUtilisateur } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  profils: ProfilUtilisateur[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "General",
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: LayoutDashboard,
        profils: ["administrateur", "gestionnaire", "consultation"],
      },
      {
        label: "Materiel",
        href: "/materiels",
        icon: Laptop,
        profils: ["administrateur", "gestionnaire", "consultation"],
      },
      {
        label: "Renouvellements",
        href: "/renouvellements",
        icon: RefreshCcw,
        profils: ["administrateur", "gestionnaire", "consultation"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Utilisateurs applicatifs",
        href: "/admin/utilisateurs",
        icon: Users,
        profils: ["administrateur"],
      },
      {
        label: "Referentiels",
        href: "/admin/referentiels",
        icon: ListTree,
        profils: ["administrateur"],
      },
      {
        label: "Journal d'audit",
        href: "/admin/journal-audit",
        icon: ScrollText,
        profils: ["administrateur"],
      },
    ],
  },
];
