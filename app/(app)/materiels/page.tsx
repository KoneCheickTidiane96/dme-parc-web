"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Laptop, Plus, Search, Pencil, Upload, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/lib/auth";
import { appelApi, API_BASE_URL } from "@/lib/api";

interface Materiel {
  id_materiel: number;
  code_poste: string;
  marque: string;
  modele: string;
  numero_serie: string;
  date_achat: string;
  age_calcule: number | null;
  observation: string | null;
  libelle_statut: string;
  libelle_type_materiel: string;
  nom_utilisateur: string | null;
  libelle_site: string | null;
  ram_mo: number | null;
  dd_go: number | null;
}

interface Statut {
  id_statut: number;
  libelle_statut: string;
}

interface ResumeImport {
  materiels_crees: number;
  materiels_mis_a_jour: number;
  types_crees: number;
  statuts_crees: number;
  utilisateurs_crees: number;
  lignes_ignorees: { ligne: number; raison: string }[];
  feuille_utilisee?: string;
}

function numeroCodePoste(codePoste: string): number {
  const correspondance = codePoste?.match(/(\d+)\s*$/);
  return correspondance ? parseInt(correspondance[1], 10) : Number.MAX_SAFE_INTEGER;
}

export default function MaterielsPage() {
  const { siteActif } = useAuth();
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const [recherche, setRecherche] = useState("");
  const [statutChoisi, setStatutChoisi] = useState("");

  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [archivageEnCours, setArchivageEnCours] = useState(false);

  const inputFichierRef = useRef<HTMLInputElement>(null);
  const [importEnCours, setImportEnCours] = useState(false);
  const [resultatImport, setResultatImport] = useState<ResumeImport | null>(null);
  const [erreurImport, setErreurImport] = useState<string | null>(null);

  function chargerMateriels() {
    if (!siteActif) return;

    setChargement(true);
    setErreur(null);

    Promise.all([
      appelApi("/api/materiels", { idSite: siteActif }),
      fetch(`${API_BASE_URL}/api/statuts`).then((res) => res.json()),
    ])
      .then(([materielsData, statutsData]) => {
        setMateriels(Array.isArray(materielsData) ? materielsData : []);
        setStatuts(Array.isArray(statutsData) ? statutsData : []);

        if (!Array.isArray(materielsData)) {
          setErreur(materielsData?.erreur || "Réponse inattendue du serveur");
        }
      })
      .catch(() => setErreur("Erreur lors du chargement des matériels"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerMateriels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteActif]);

  const materielsFiltres = useMemo(() => {
    return materiels
      .filter((m) => {
        const correspondRecherche =
          recherche.trim() === "" ||
          m.code_poste?.toLowerCase().includes(recherche.toLowerCase()) ||
          m.numero_serie?.toLowerCase().includes(recherche.toLowerCase()) ||
          m.nom_utilisateur?.toLowerCase().includes(recherche.toLowerCase()) ||
          m.marque?.toLowerCase().includes(recherche.toLowerCase()) ||
          m.modele?.toLowerCase().includes(recherche.toLowerCase());

        const correspondStatut = statutChoisi === "" || m.libelle_statut === statutChoisi;

        return correspondRecherche && correspondStatut;
      })
      .sort((a, b) => numeroCodePoste(a.code_poste) - numeroCodePoste(b.code_poste));
  }, [materiels, recherche, statutChoisi]);

  const touteLaSelection = materielsFiltres.length > 0 && materielsFiltres.every((m) => selection.has(m.id_materiel));

  function basculerLigne(id: number) {
    setSelection((precedent) => {
      const nouveau = new Set(precedent);
      if (nouveau.has(id)) nouveau.delete(id);
      else nouveau.add(id);
      return nouveau;
    });
  }

  function basculerTout() {
    setSelection((precedent) => {
      if (touteLaSelection) return new Set();
      return new Set(materielsFiltres.map((m) => m.id_materiel));
    });
  }

  async function archiverSelection() {
    if (selection.size === 0) return;
    if (!confirm(`Archiver ${selection.size} matériel(s) sélectionné(s) ?`)) return;

    setArchivageEnCours(true);
    const token = localStorage.getItem("token");

    try {
      await Promise.all(
        Array.from(selection).map((id) =>
          fetch(`${API_BASE_URL}/api/materiels/${id}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
        )
      );
      setSelection(new Set());
      chargerMateriels();
    } catch {
      setErreur("Erreur lors de l'archivage de la sélection");
    } finally {
      setArchivageEnCours(false);
    }
  }

  function ouvrirSelecteurFichier() {
    setResultatImport(null);
    setErreurImport(null);
    inputFichierRef.current?.click();
  }

  async function gererFichierChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier || !siteActif) return;

    setImportEnCours(true);
    setResultatImport(null);
    setErreurImport(null);

    try {
      const token = localStorage.getItem("token");
      const donnees = new FormData();
      donnees.append("fichier", fichier);

      const res = await fetch(
        `${API_BASE_URL}/api/materiels/import?id_site=${siteActif}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: donnees,
        }
      );

      const resultat = await res.json();

      if (!res.ok) {
        throw new Error(resultat?.erreur || "Erreur lors de l'import");
      }

      setResultatImport(resultat);
      chargerMateriels();
    } catch (err) {
      setErreurImport(err instanceof Error ? err.message : "Erreur lors de l'import");
    } finally {
      setImportEnCours(false);
      if (inputFichierRef.current) inputFichierRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materiel</h1>
          <p className="text-muted-foreground">
            Recherche multicritere (site, type, statut, utilisateur, marque, age) - section 5.2.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputFichierRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={gererFichierChoisi}
          />
          <Button variant="outline" onClick={ouvrirSelecteurFichier} disabled={importEnCours}>
            <Upload />
            {importEnCours ? "Import en cours..." : "Importer Excel"}
          </Button>
          <Button render={<Link href="/materiels/nouveau"><Plus />Nouvelle fiche</Link>} />
        </div>
      </div>

      {resultatImport && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Résultat de l&apos;import</CardTitle>
            <CardDescription>
              {resultatImport.feuille_utilisee && `Feuille "${resultatImport.feuille_utilisee}" — `}
              {resultatImport.materiels_crees} créé(s), {resultatImport.materiels_mis_a_jour} mis à jour
              {resultatImport.types_crees > 0 && ` — ${resultatImport.types_crees} type(s) créé(s)`}
              {resultatImport.statuts_crees > 0 && ` — ${resultatImport.statuts_crees} statut(s) créé(s)`}
              {resultatImport.utilisateurs_crees > 0 && ` — ${resultatImport.utilisateurs_crees} utilisateur(s) créé(s)`}
            </CardDescription>
          </CardHeader>
          {resultatImport.lignes_ignorees.length > 0 && (
            <CardContent>
              <p className="mb-2 text-sm font-medium text-destructive">
                {resultatImport.lignes_ignorees.length} ligne(s) ignorée(s) :
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {resultatImport.lignes_ignorees.slice(0, 20).map((l, i) => (
                  <li key={i}>Ligne {l.ligne} : {l.raison}</li>
                ))}
                {resultatImport.lignes_ignorees.length > 20 && (
                  <li>... et {resultatImport.lignes_ignorees.length - 20} autre(s)</li>
                )}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {erreurImport && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{erreurImport}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste du parc</CardTitle>
          <CardDescription>Vue consolidee, filtrable par site, type et statut.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Code poste, numero de serie, utilisateur..."
                className="pl-8"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            <Select
              value={statutChoisi || "tous"}
              onValueChange={(valeur) => setStatutChoisi(valeur === "tous" ? "" : valeur)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                {statuts.map((s) => (
                  <SelectItem key={s.id_statut} value={s.libelle_statut}>
                    {s.libelle_statut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selection.size > 0 && (
              <Button variant="destructive" onClick={archiverSelection} disabled={archivageEnCours}>
                <Archive />
                {archivageEnCours ? "Archivage..." : `Archiver (${selection.size})`}
              </Button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={touteLaSelection}
                      onChange={basculerTout}
                      className="size-4 cursor-pointer accent-primary"
                    />
                  </TableHead>
                  <TableHead className="w-28">Code poste</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-32">Marque / Modele</TableHead>
                  <TableHead className="w-24">RAM / DD</TableHead>
                  <TableHead className="w-28">Utilisateur</TableHead>
                  <TableHead className="w-28">Site</TableHead>
                  <TableHead className="w-32">Statut</TableHead>
                  <TableHead className="w-24">Date d&apos;achat</TableHead>
                  <TableHead className="w-14">Age</TableHead>
                  <TableHead className="w-14">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargement ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="p-6 text-center text-sm text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : erreur ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="p-6 text-center text-sm text-destructive">
                      {erreur}
                    </TableCell>
                  </TableRow>
                ) : materielsFiltres.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="p-0">
                      <EmptyState
                        icon={Laptop}
                        title="Aucun materiel"
                        description="Aucun materiel ne correspond a ta recherche."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  materielsFiltres.map((m) => (
                    <TableRow key={m.id_materiel}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selection.has(m.id_materiel)}
                          onChange={() => basculerLigne(m.id_materiel)}
                          className="size-4 cursor-pointer accent-primary"
                        />
                      </TableCell>
                      <TableCell className="truncate">{m.code_poste}</TableCell>
                      <TableCell className="truncate">{m.libelle_type_materiel}</TableCell>
                      <TableCell className="truncate">{m.marque} {m.modele}</TableCell>
                      <TableCell className="truncate text-xs">
                        {m.ram_mo ? `${m.ram_mo}Mo` : "—"}/{m.dd_go ? `${m.dd_go}Go` : "—"}
                      </TableCell>
                      <TableCell className="truncate">{m.nom_utilisateur ?? "—"}</TableCell>
                      <TableCell className="truncate">{m.libelle_site ?? "—"}</TableCell>
                      <TableCell className="text-xs break-words">{m.libelle_statut}</TableCell>
                      <TableCell className="truncate text-xs">{formatDate(m.date_achat)}</TableCell>
                      <TableCell>{m.age_calcule ?? "—"}</TableCell>
                      <TableCell>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          render={<Link href={`/materiels/${m.id_materiel}`} />}
                        >
                          <Pencil className="size-4" />
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