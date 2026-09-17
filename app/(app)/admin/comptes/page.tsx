"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, Check, X, Trash2 } from "lucide-react";
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
import { useAuth } from "@/lib/auth";

interface Compte {
  id_compte: number;
  identifiant: string;
  profil: string;
  id_site: number | null;
  libelle_site: string | null;
}

interface Site {
  id_site: number;
  libelle_site: string;
}

function enTeteAuth() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ComptesPage() {
  const { user } = useAuth();
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Ligne dont on est en train de changer le mot de passe
  const [compteEnEdition, setCompteEnEdition] = useState<number | null>(null);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");

  // Formulaire d'ajout d'un nouveau compte
  const [afficherFormulaireAjout, setAfficherFormulaireAjout] = useState(false);
  const [nouvelIdentifiant, setNouvelIdentifiant] = useState("");
  const [nouveauMdpCreation, setNouveauMdpCreation] = useState("");
  const [nouveauProfil, setNouveauProfil] = useState("gestionnaire");
  const [nouveauSite, setNouveauSite] = useState("");

  function chargerDonnees() {
    setChargement(true);
    Promise.all([
      fetch("http://localhost:5000/api/comptes", { headers: enTeteAuth() }).then((res) => res.json()),
      fetch("http://localhost:5000/api/sites").then((res) => res.json()),
    ])
      .then(([comptesData, sitesData]) => {
        setComptes(Array.isArray(comptesData) ? comptesData : []);
        setSites(Array.isArray(sitesData) ? sitesData : []);
      })
      .catch(() => setErreur("Erreur lors du chargement des comptes"))
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function creerCompte() {
    setErreur(null);
    if (!nouvelIdentifiant.trim() || !nouveauMdpCreation) {
      setErreur("Identifiant et mot de passe sont requis");
      return;
    }
    if (nouveauProfil === "gestionnaire" && !nouveauSite) {
      setErreur("Choisis un site pour ce gestionnaire");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/comptes", {
        method: "POST",
        headers: enTeteAuth(),
        body: JSON.stringify({
          identifiant: nouvelIdentifiant,
          mot_de_passe: nouveauMdpCreation,
          profil: nouveauProfil,
          id_site: nouveauSite ? Number(nouveauSite) : null,
        }),
      });
      const resultat = await res.json();
      if (!res.ok) throw new Error(resultat?.erreur || "Erreur lors de la création");

      setNouvelIdentifiant("");
      setNouveauMdpCreation("");
      setNouveauProfil("gestionnaire");
      setNouveauSite("");
      setAfficherFormulaireAjout(false);
      chargerDonnees();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de la création");
    }
  }

  function commencerChangementMdp(idCompte: number) {
    setCompteEnEdition(idCompte);
    setNouveauMotDePasse("");
    setErreur(null);
  }

  async function enregistrerNouveauMdp(idCompte: number) {
    if (nouveauMotDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/comptes/${idCompte}/mot-de-passe`, {
        method: "PUT",
        headers: enTeteAuth(),
        body: JSON.stringify({ nouveau_mot_de_passe: nouveauMotDePasse }),
      });
      const resultat = await res.json();
      if (!res.ok) throw new Error(resultat?.erreur || "Erreur lors du changement de mot de passe");

      setCompteEnEdition(null);
      setNouveauMotDePasse("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe");
    }
  }

  async function supprimerCompte(idCompte: number) {
    if (!confirm("Supprimer définitivement ce compte ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/comptes/${idCompte}`, {
        method: "DELETE",
        headers: enTeteAuth(),
      });
      const resultat = await res.json();
      if (!res.ok) throw new Error(resultat?.erreur || "Erreur lors de la suppression");
      chargerDonnees();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }

  if (chargement) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comptes applicatifs</h1>
          <p className="text-muted-foreground">
            Gère les identifiants de connexion : crée un compte gestionnaire, change un mot de passe.
          </p>
        </div>
        <Button onClick={() => setAfficherFormulaireAjout((v) => !v)}>
          <Plus />
          Nouveau compte
        </Button>
      </div>

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      {afficherFormulaireAjout && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créer un compte</CardTitle>
            <CardDescription>Choisis un identifiant unique et un mot de passe d&apos;au moins 6 caractères.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="identifiant">Identifiant</Label>
              <Input id="identifiant" value={nouvelIdentifiant} onChange={(e) => setNouvelIdentifiant(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motdepasse">Mot de passe</Label>
              <Input
                id="motdepasse"
                type="password"
                value={nouveauMdpCreation}
                onChange={(e) => setNouveauMdpCreation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profil">Profil</Label>
              <select
                id="profil"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                value={nouveauProfil}
                onChange={(e) => setNouveauProfil(e.target.value)}
              >
                <option value="gestionnaire">Gestionnaire</option>
                <option value="administrateur">Administrateur</option>
              </select>
            </div>
            {/* Le site n'est demandé que pour un gestionnaire : un administrateur voit tous les sites */}
            {nouveauProfil === "gestionnaire" && (
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <select
                  id="site"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={nouveauSite}
                  onChange={(e) => setNouveauSite(e.target.value)}
                >
                  <option value="" disabled>Choisir un site</option>
                  {sites.map((s) => (
                    <option key={s.id_site} value={s.id_site}>
                      {s.libelle_site}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={creerCompte}>Créer le compte</Button>
              <Button variant="outline" onClick={() => setAfficherFormulaireAjout(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            Comptes existants
          </CardTitle>
          <CardDescription>Le mot de passe actuel n&apos;est jamais affiché — tu peux seulement le remplacer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Profil</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead className="w-64">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comptes.map((c) => (
                  <TableRow key={c.id_compte}>
                    <TableCell>{c.identifiant}</TableCell>
                    <TableCell className="capitalize">{c.profil}</TableCell>
                    <TableCell>{c.libelle_site ?? "Tous les sites"}</TableCell>
                    <TableCell>
                      {compteEnEdition === c.id_compte ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={nouveauMotDePasse}
                            onChange={(e) => setNouveauMotDePasse(e.target.value)}
                            className="h-8 w-40"
                          />
                          <Button size="icon-sm" variant="ghost" onClick={() => enregistrerNouveauMdp(c.id_compte)}>
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setCompteEnEdition(null)}>
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => commencerChangementMdp(c.id_compte)}>
                            <KeyRound className="size-3.5" />
                            Mot de passe
                          </Button>
                          {/* On ne peut pas se supprimer soi-meme (le bouton est cache pour son propre compte) */}
                          {user?.identifiant !== c.identifiant && (
                            <Button size="icon-sm" variant="ghost" onClick={() => supprimerCompte(c.id_compte)}>
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}