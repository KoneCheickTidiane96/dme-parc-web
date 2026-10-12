"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/format";
import { appelApi } from "@/lib/api";

interface LigneAudit {
  id_audit: number;
  identifiant: string;
  action: string;
  entite: string;
  id_entite: number | null;
  details: string | null;
  date_action: string;
}

const colonnes = ["Date", "Utilisateur", "Action", "Entité", "Détails"];

// Associe chaque type d'action a une couleur de badge, pour reperer
// rapidement d'un coup d'oeil les creations/modifications/suppressions
function couleurAction(action: string) {
  if (action === "création") return "success";
  if (action === "modification") return "secondary";
  if (action === "suppression") return "destructive";
  return "secondary";
}

export default function JournalAuditPage() {
  const [lignes, setLignes] = useState<LigneAudit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Chargement des dernieres actions enregistrees
  useEffect(() => {
    appelApi("/api/journal-audit")
      .then((resultat) => setLignes(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreur("Erreur lors du chargement du journal d'audit"))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal d&apos;audit</h1>
        <p className="text-muted-foreground">
          Historique des créations, modifications et suppressions (200 dernières actions).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="size-4" />
            Actions récentes
          </CardTitle>
          <CardDescription>Chaque action importante est enregistrée automatiquement, avec l&apos;identifiant de l&apos;auteur.</CardDescription>
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
                ) : lignes.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-0">
                      <EmptyState
                        icon={ScrollText}
                        title="Aucune action enregistrée"
                        description="Les actions apparaîtront ici au fur et à mesure de leur réalisation."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  lignes.map((ligne) => (
                    <TableRow key={ligne.id_audit}>
                      <TableCell className="whitespace-nowrap">{formatDate(ligne.date_action)}</TableCell>
                      <TableCell>{ligne.identifiant}</TableCell>
                      <TableCell>
                        <Badge variant={couleurAction(ligne.action)} className="capitalize">
                          {ligne.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{ligne.entite}</TableCell>
                      <TableCell className="text-muted-foreground">{ligne.details ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}