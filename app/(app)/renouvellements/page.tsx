"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/auth";
import { appelApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Renouvellement {
  id_materiel: number;
  code_poste: string;
  marque: string;
  modele: string;
  date_achat: string;
  duree_amortissement: number;
  libelle_statut: string;
  libelle_type_materiel: string;
  date_renouvellement: string;
  jours_restants: number;
}

const colonnes = ["Code poste", "Type", "Marque / Modele", "Statut", "Date de renouvellement", "Urgence"];

function niveauUrgence(joursRestants: number) {
  if (joursRestants < 0) {
    return { texte: "Depasse", couleur: "text-destructive font-semibold" };
  }
  if (joursRestants <= 30) {
    return { texte: `${joursRestants} j (urgent)`, couleur: "text-destructive" };
  }
  return { texte: `${joursRestants} j`, couleur: "text-muted-foreground" };
}

export default function RenouvellementsPage() {
  const { siteActif } = useAuth();
  const [renouvellements, setRenouvellements] = useState<Renouvellement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!siteActif) return;

    setChargement(true);
    appelApi("/api/renouvellements", { idSite: siteActif })
      .then((resultat) => setRenouvellements(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreur("Erreur lors du chargement des renouvellements"))
      .finally(() => setChargement(false));
  }, [siteActif]);

  // Declenche le telechargement dans le format choisi (pdf, word ou excel),
  // en creant un lien temporaire invisible plutot qu'un <a href> statique
  // (puisque l'URL depend maintenant du format cliqué)
  function exporter(format: "pdf" | "word" | "excel") {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const params = new URLSearchParams();
    if (siteActif) params.set("id_site", siteActif);
    if (token) params.set("token", token);
    params.set("format", format);

    const url = `http://localhost:5000/api/renouvellements/export?${params.toString()}`;
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = "";
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Renouvellements</h1>
          <p className="text-muted-foreground">
            Materiel dont la date de renouvellement approche (moins de 90 jours) ou est deja depassee.
          </p>
        </div>

        {/* Menu deroulant : choix du format d'export */}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alertes de renouvellement</CardTitle>
          <CardDescription>Calculees a partir de la date d&apos;achat et de la duree d&apos;amortissement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {colonnes.map((colonne) => (
                    <TableHead key={colonne}>{colonne}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargement ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-6 text-center text-sm text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : erreur ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-6 text-center text-sm text-destructive">
                      {erreur}
                    </TableCell>
                  </TableRow>
                ) : renouvellements.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-0">
                      <EmptyState
                        icon={AlertTriangle}
                        title="Aucune alerte"
                        description="Aucun materiel n'approche de sa date de renouvellement pour le moment."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  renouvellements.map((r) => {
                    const urgence = niveauUrgence(r.jours_restants);
                    return (
                      <TableRow key={r.id_materiel}>
                        <TableCell>{r.code_poste}</TableCell>
                        <TableCell>{r.libelle_type_materiel}</TableCell>
                        <TableCell>{r.marque} {r.modele}</TableCell>
                        <TableCell>{r.libelle_statut}</TableCell>
                        <TableCell>{formatDate(r.date_renouvellement)}</TableCell>
                        <TableCell className={urgence.couleur}>{urgence.texte}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}