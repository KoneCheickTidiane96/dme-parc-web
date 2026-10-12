"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, Plus, UserMinus } from "lucide-react";
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

interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  fonction: string;
  matricule: string;
}

const colonnes = ["", "Nom", "Fonction", "Matricule"];

export default function UtilisateursPage() {
  const { siteActif } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [retraitEnCours, setRetraitEnCours] = useState(false);

  function chargerUtilisateurs() {
    if (!siteActif) return;

    setChargement(true);
    setErreur(null);

    appelApi("/api/utilisateurs", { idSite: siteActif })
      .then((resultat) => setUtilisateurs(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreur("Erreur lors du chargement des utilisateurs"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerUtilisateurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteActif]);

  // Tri alphabetique par nom (A a Z)
  const utilisateursTries = useMemo(
    () =>
      [...utilisateurs].sort((a, b) =>
        a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" })
      ),
    [utilisateurs]
  );

  const touteLaSelection =
    utilisateursTries.length > 0 &&
    utilisateursTries.every((u) => selection.has(u.id_utilisateur));

  function basculerLigne(id: number) {
    setSelection((precedent) => {
      const nouveau = new Set(precedent);
      if (nouveau.has(id)) nouveau.delete(id);
      else nouveau.add(id);
      return nouveau;
    });
  }

  function basculerTout() {
    setSelection(() => {
      if (touteLaSelection) return new Set();
      return new Set(utilisateursTries.map((u) => u.id_utilisateur));
    });
  }

  // Retire (date_retrait + liberation du materiel) tous les utilisateurs coches
  async function retirerSelection() {
    if (selection.size === 0) return;
    if (
      !confirm(
        `Retirer ${selection.size} utilisateur(s) sélectionné(s) ? Leur matériel sera libéré.`
      )
    )
      return;

    setRetraitEnCours(true);
    const nombre = selection.size;

    try {
      await Promise.all(
        Array.from(selection).map((id) =>
          appelApi(`/api/utilisateurs/${id}/retirer`, {
            methode: "PUT",
            idSite: siteActif,
          })
        )
      );
      setSelection(new Set());
      chargerUtilisateurs();
      // Message de confirmation
      toast.success(`${nombre} utilisateur(s) retiré(s) avec succès`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du retrait de la sélection";
      setErreur(message);
      toast.error(message);
    } finally {
      setRetraitEnCours(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Agents de la DME auxquels du materiel peut etre affecte.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selection.size > 0 && (
            <Button variant="destructive" onClick={retirerSelection} disabled={retraitEnCours}>
              <UserMinus />
              {retraitEnCours ? "Retrait..." : `Retirer (${selection.size})`}
            </Button>
          )}
          <Button
            nativeButton={false}
            render={<Link href="/admin/utilisateurs/nouveau"><Plus />Nouvel utilisateur</Link>}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste des utilisateurs</CardTitle>
          <CardDescription>Chaque agent peut recevoir une ou plusieurs affectations de materiel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {colonnes.map((colonne, i) =>
                    i === 0 ? (
                      <TableHead key="case-tout" className="w-10">
                        <input
                          type="checkbox"
                          checked={touteLaSelection}
                          onChange={basculerTout}
                          className="size-4 cursor-pointer accent-primary"
                        />
                      </TableHead>
                    ) : (
                      <TableHead key={colonne}>{colonne}</TableHead>
                    )
                  )}
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
                ) : utilisateursTries.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colonnes.length} className="p-0">
                      <EmptyState
                        icon={Users}
                        title="Aucun utilisateur"
                        description="Ajoute un utilisateur pour commencer a affecter du materiel."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  utilisateursTries.map((u) => (
                    <TableRow key={u.id_utilisateur}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selection.has(u.id_utilisateur)}
                          onChange={() => basculerLigne(u.id_utilisateur)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                      </TableCell>
                      <TableCell>{u.nom}</TableCell>
                      <TableCell>{u.fonction}</TableCell>
                      <TableCell>{u.matricule}</TableCell>
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