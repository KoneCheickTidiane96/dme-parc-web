"use client";

import { useEffect, useState } from "react";
import { ListTree, Plus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appelApi } from "@/lib/api";

interface TypeMateriel {
  id_type_materiel: number;
  libelle_type_materiel: string;
  duree_vie_standard_annees: number | null;
}

interface Statut {
  id_statut: number;
  libelle_statut: string;
}

export default function ReferentielsPage() {
  const [types, setTypes] = useState<TypeMateriel[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Identifiant de la ligne en cours d'edition (type ou statut), null si aucune
  const [typeEnEdition, setTypeEnEdition] = useState<number | null>(null);
  const [statutEnEdition, setStatutEnEdition] = useState<number | null>(null);

  // Valeurs temporaires pendant l'edition d'une ligne
  const [libelleTypeTemp, setLibelleTypeTemp] = useState("");
  const [dureeTypeTemp, setDureeTypeTemp] = useState("");
  const [libelleStatutTemp, setLibelleStatutTemp] = useState("");

  // Valeurs des formulaires d'ajout
  const [nouveauLibelleType, setNouveauLibelleType] = useState("");
  const [nouvelleDureeType, setNouvelleDureeType] = useState("");
  const [nouveauLibelleStatut, setNouveauLibelleStatut] = useState("");

  // Affiche une erreur (texte rouge + message rouge)
  function signalerErreur(err: unknown, parDefaut: string) {
    const message = err instanceof Error && err.message ? err.message : parDefaut;
    setErreur(message);
    toast.error(message);
  }

  // Chargement des types et des statuts
  function chargerDonnees() {
    setChargement(true);
    Promise.all([appelApi("/api/types-materiel"), appelApi("/api/statuts")])
      .then(([typesData, statutsData]) => {
        setTypes(Array.isArray(typesData) ? typesData : []);
        setStatuts(Array.isArray(statutsData) ? statutsData : []);
      })
      .catch(() => setErreur("Erreur lors du chargement des référentiels"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  // ---------- Types de materiel ----------

  function commencerEditionType(t: TypeMateriel) {
    setTypeEnEdition(t.id_type_materiel);
    setLibelleTypeTemp(t.libelle_type_materiel);
    setDureeTypeTemp(String(t.duree_vie_standard_annees ?? ""));
  }

  async function enregistrerType(id: number) {
    try {
      await appelApi(`/api/types-materiel/${id}`, {
        methode: "PUT",
        corps: {
          libelle_type_materiel: libelleTypeTemp,
          duree_vie_standard_annees: dureeTypeTemp ? Number(dureeTypeTemp) : null,
        },
      });
      setTypeEnEdition(null);
      setErreur(null);
      chargerDonnees();
      toast.success("Type de matériel modifié avec succès");
    } catch (err) {
      signalerErreur(err, "Erreur lors de la modification du type");
    }
  }

  async function ajouterType() {
    if (!nouveauLibelleType.trim()) return;
    try {
      await appelApi("/api/types-materiel", {
        methode: "POST",
        corps: {
          libelle_type_materiel: nouveauLibelleType,
          duree_vie_standard_annees: nouvelleDureeType ? Number(nouvelleDureeType) : null,
        },
      });
      setNouveauLibelleType("");
      setNouvelleDureeType("");
      setErreur(null);
      chargerDonnees();
      toast.success("Type de matériel ajouté avec succès");
    } catch (err) {
      signalerErreur(err, "Erreur lors de la création du type");
    }
  }

  // ---------- Statuts ----------

  function commencerEditionStatut(s: Statut) {
    setStatutEnEdition(s.id_statut);
    setLibelleStatutTemp(s.libelle_statut);
  }

  async function enregistrerStatut(id: number) {
    try {
      await appelApi(`/api/statuts/${id}`, {
        methode: "PUT",
        corps: { libelle_statut: libelleStatutTemp },
      });
      setStatutEnEdition(null);
      setErreur(null);
      chargerDonnees();
      toast.success("Statut modifié avec succès");
    } catch (err) {
      signalerErreur(err, "Erreur lors de la modification du statut");
    }
  }

  async function ajouterStatut() {
    if (!nouveauLibelleStatut.trim()) return;
    try {
      await appelApi("/api/statuts", {
        methode: "POST",
        corps: { libelle_statut: nouveauLibelleStatut },
      });
      setNouveauLibelleStatut("");
      setErreur(null);
      chargerDonnees();
      toast.success("Statut ajouté avec succès");
    } catch (err) {
      signalerErreur(err, "Erreur lors de la création du statut");
    }
  }

  if (chargement) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Référentiels</h1>
        <p className="text-muted-foreground">
          Gestion des types de matériel (avec leur durée de vie) et des statuts.
        </p>
      </div>

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      {/* Types de materiel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTree className="size-4" />
            Types de matériel
          </CardTitle>
          <CardDescription>Chaque type porte une durée de vie standard (en années), utilisée pour calculer les alertes de renouvellement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Durée de vie (ans)</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id_type_materiel}>
                    {typeEnEdition === t.id_type_materiel ? (
                      <>
                        <TableCell>
                          <Input value={libelleTypeTemp} onChange={(e) => setLibelleTypeTemp(e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={dureeTypeTemp} onChange={(e) => setDureeTypeTemp(e.target.value)} />
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="icon-sm" variant="ghost" onClick={() => enregistrerType(t.id_type_materiel)}>
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setTypeEnEdition(null)}>
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{t.libelle_type_materiel}</TableCell>
                        <TableCell>{t.duree_vie_standard_annees ?? "-"}</TableCell>
                        <TableCell>
                          <Button size="icon-sm" variant="ghost" onClick={() => commencerEditionType(t)}>
                            <Pencil className="size-4" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Formulaire d'ajout d'un nouveau type */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="nouveauType">Nouveau type</Label>
              <Input
                id="nouveauType"
                placeholder="Ex. Imprimante"
                value={nouveauLibelleType}
                onChange={(e) => setNouveauLibelleType(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nouvelleDuree">Durée de vie (ans)</Label>
              <Input
                id="nouvelleDuree"
                type="number"
                className="w-32"
                value={nouvelleDureeType}
                onChange={(e) => setNouvelleDureeType(e.target.value)}
              />
            </div>
            <Button onClick={ajouterType}>
              <Plus />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTree className="size-4" />
            Statuts
          </CardTitle>
          <CardDescription>Les statuts possibles pour le matériel (En service, En stock, Amorti...).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuts.map((s) => (
                  <TableRow key={s.id_statut}>
                    {statutEnEdition === s.id_statut ? (
                      <>
                        <TableCell>
                          <Input value={libelleStatutTemp} onChange={(e) => setLibelleStatutTemp(e.target.value)} />
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="icon-sm" variant="ghost" onClick={() => enregistrerStatut(s.id_statut)}>
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setStatutEnEdition(null)}>
                            <X className="size-4" />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{s.libelle_statut}</TableCell>
                        <TableCell>
                          <Button size="icon-sm" variant="ghost" onClick={() => commencerEditionStatut(s)}>
                            <Pencil className="size-4" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Formulaire d'ajout d'un nouveau statut */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="nouveauStatut">Nouveau statut</Label>
              <Input
                id="nouveauStatut"
                placeholder="Ex. En réparation"
                value={nouveauLibelleStatut}
                onChange={(e) => setNouveauLibelleStatut(e.target.value)}
              />
            </div>
            <Button onClick={ajouterStatut}>
              <Plus />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}