import { Laptop, Clock3, AlertTriangle, PieChart, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Indicateur {
  titre: string;
  description: string;
  icon: LucideIcon;
  tone?: "warning";
}

const indicateurs: Indicateur[] = [
  { titre: "Total materiel", description: "Tous sites confondus", icon: Laptop },
  { titre: "Age moyen du parc", description: "En annees", icon: Clock3 },
  {
    titre: "A renouveler",
    description: "Alertes court terme",
    icon: AlertTriangle,
    tone: "warning",
  },
  { titre: "Types de materiel", description: "Referentiel actif", icon: PieChart },
];

const largeursSkeleton = ["w-4/5", "w-3/5", "w-2/3", "w-1/2", "w-1/3"];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Indicateurs consolides et graphiques de repartition (section 5.5 du cahier des charges).
          A brancher sur l&apos;API une fois disponible.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicateurs.map((indicateur) => {
          const Icon = indicateur.icon;
          return (
            <Card key={indicateur.titre}>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1">
                  <CardDescription>{indicateur.titre}</CardDescription>
                  <CardTitle className="text-3xl font-semibold">—</CardTitle>
                </div>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    indicateur.tone === "warning"
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{indicateur.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par statut</CardTitle>
            <CardDescription>En service, en stock, debranche, amorti...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {largeursSkeleton.map((largeur, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-4 w-20 shrink-0" />
                <Skeleton className={cn("h-4 rounded-full", largeur)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par site</CardTitle>
            <CardDescription>Abidjan-Plateau vs Yamoussoukro (NDY)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {largeursSkeleton.slice(0, 3).map((largeur, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-4 w-20 shrink-0" />
                <Skeleton className={cn("h-4 rounded-full", largeur)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
