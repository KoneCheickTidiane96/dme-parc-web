"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Plus, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

// Une affectation en cours (reponse du back-end)
interface Affectation {
  id_affecter: number;
  date_debut: string;
  date_fin: string | null;
  id_materiel: number;
  code_poste: string;
  marque: string;
  modele: string;
  id_utilisateur: number;
  nom_utilisateur: string;
}

const colonnes = ["Code poste", "Materiel", "Utilisateur", "Date de debut", "Action"];

// Extrait le nombre a la fin du code poste (ex: "PC-DME 12" -> 12) pour trier 1, 2, 3...
function numeroCodePoste(code: string): number {
  const resultat = /(\d+)\s*$/.exec(code ?? "");
  return resultat ? Number(resultat[1]) : Number.MAX_SAFE_INTEGER;
}

// Affiche une date en format francais (ex: 12/10/2026)
function formaterDate(valeur: string | null): string {
  if (!valeur) return "-";
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? String(valeur) : date.toLocaleDateString("fr-FR");
}

export default function AffectationsPage() {
  const { siteActif } = useAuth();
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [retraitEnCours, setRetraitEnCours] = useState<number | null>(null);

  // Chargement des affectations en cours du site actif
  function chargerAffectations() {
    if (!siteActif) return;

    setChargement(true);
    setErreur(null);

    appelApi("/api/affectations", { idSite: siteActif })
      .then((resultat) => setAffectations(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreur("Erreur lors du chargement des affectations"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerAffectations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteActif]);

  // Tri par numero de code poste croissant
  const affectationsTriees = useMemo(
    () =>
      [...affectations].sort(
        (a, b) =>
          numeroCodePoste(a.code_poste) - numeroCodePoste(b.code_poste) ||
          (a.code_poste ?? "").localeCompare(b.code_poste ?? "", "fr", { sensitivity: "base" })
      ),
    [affectations]
  );

  // Termine une affectation (le materiel redevient disponible)
  async function retirerAffectation(a: Affectation) {
    if (
      !confirm(
        `Retirer le matériel ${a.code_poste} à ${a.nom_utilisateur} ? L'affectation sera clôturée.`
      )
    )
      return;

    setRetraitEnCours(a.id_affecter);
    try {
      await appelApi(`/api/affectations/${a.id_affecter}/retirer`, {
        methode: "PUT",
        idSite: siteActif,
      });
      chargerAffectations();
      // Message de confirmation
      toast.success("Matériel retiré avec succès");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du retrait du matériel";
      toast.error(message);
    } finally {
      setRetraitEnCours(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Affectations</h1>
          <p className="text-muted-foreground">
            Materiel actuellement attribue aux agents de la DME.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/affectations/nouveau"><Plus />Nouvelle affectation</Link>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Affectations en cours</CardTitle>
          <CardDescription>
            Un materiel ne peut etre affecte qu&apos;a un seul agent a la fois.
          </CardDescription>
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
                ) : affectationsTriees.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-0">
                      <EmptyState
                        icon={ArrowLeftRight}
                        title="Aucune affectation en cours"
                        description="Cree une affectation pour attribuer un materiel a un agent."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  affectationsTriees.map((a) => (
                    <TableRow key={a.id_affecter}>
                      <TableCell className="font-medium">{a.code_poste}</TableCell>
                      <TableCell>
                        {a.marque} {a.modele}
                      </TableCell>
                      <TableCell>{a.nom_utilisateur}</TableCell>
                      <TableCell>{formaterDate(a.date_debut)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retirerAffectation(a)}
                          disabled={retraitEnCours === a.id_affecter}
                        >
                          <Undo2 className="size-3.5" />
                          {retraitEnCours === a.id_affecter ? "Retrait..." : "Retirer"}
                        </Button>
                      </TableCell>
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