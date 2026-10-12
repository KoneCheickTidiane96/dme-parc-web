"use client";

import { useEffect, useState } from "react";
import { Laptop, AlertTriangle, Calendar, PieChart, Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { API_BASE_URL, appelApi } from "@/lib/api";

interface RepartitionItem {
  libelle_statut?: string;
  libelle_type_materiel?: string;
  nombre: number;
}

interface DashboardData {
  total_materiel: number;
  repartition_statut: RepartitionItem[];
  repartition_type: RepartitionItem[];
  age_moyen: number;
  materiel_a_renouveler: number;
}

// Barre de repartition avec pourcentage
function BarreRepartition({ libelle, nombre, total }: { libelle: string; nombre: number; total: number }) {
  const pourcentage = total > 0 ? Math.round((nombre / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{libelle}</span>
        <span className="text-muted-foreground">{nombre} ({pourcentage}%)</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { siteActif } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Chargement des indicateurs du site actif
  useEffect(() => {
    if (!siteActif) return;

    setChargement(true);
    setErreur(null);

    appelApi("/api/dashboard", { idSite: siteActif })
      .then((resultat) => setData(resultat))
      .catch(() => setErreur("Erreur lors du chargement du tableau de bord"))
      .finally(() => setChargement(false));
  }, [siteActif]);

  // Telechargement de l'export (PDF, Word ou Excel)
  function exporter(format: "pdf" | "word" | "excel") {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const params = new URLSearchParams();
    if (siteActif) params.set("id_site", siteActif);
    if (token) params.set("token", token);
    params.set("format", format);

    const url = `${API_BASE_URL}/api/dashboard/export?${params.toString()}`;
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "";
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  }

  if (chargement) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (erreur || !data) {
    return <p className="text-sm text-destructive">{erreur ?? "Erreur inconnue"}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Indicateurs consolides du parc micro-informatique DME.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline"><Download />Exporter</Button>} />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exporter("pdf")}>
                <FileText />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exporter("word")}>
                <FileType />
                Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exporter("excel")}>
                <FileSpreadsheet />
                Excel
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total materiel</CardTitle>
            <Laptop className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_materiel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age moyen du parc</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.age_moyen} ans</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A renouveler</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.materiel_a_renouveler}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types de materiel</CardTitle>
            <PieChart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.repartition_type.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par statut</CardTitle>
            <CardDescription>Nombre de materiels pour chaque statut.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.repartition_statut.map((item) => (
              <BarreRepartition
                key={item.libelle_statut}
                libelle={item.libelle_statut ?? ""}
                nombre={item.nombre}
                total={data.total_materiel}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repartition par type</CardTitle>
            <CardDescription>Nombre de materiels pour chaque type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.repartition_type.map((item) => (
              <BarreRepartition
                key={item.libelle_type_materiel}
                libelle={item.libelle_type_materiel ?? ""}
                nombre={item.nombre}
                total={data.total_materiel}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}