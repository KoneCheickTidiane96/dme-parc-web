"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { appelApi } from "@/lib/api";

const affectationSchema = z.object({
  idMateriel: z.string().min(1, "Materiel requis"),
  idUtilisateur: z.string().min(1, "Utilisateur requis"),
  dateDebut: z.string().min(1, "Date de debut requise"),
});

type AffectationFormInput = z.input<typeof affectationSchema>;
type AffectationFormOutput = z.output<typeof affectationSchema>;

interface MaterielOption {
  id_materiel: number;
  code_poste: string;
  marque: string;
  modele: string;
}

interface UtilisateurOption {
  id_utilisateur: number;
  nom: string;
  fonction: string;
}

export default function NouvelleAffectationPage() {
  const router = useRouter();
  const { siteActif } = useAuth();

  const [materiels, setMateriels] = useState<MaterielOption[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurOption[]>([]);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AffectationFormInput, unknown, AffectationFormOutput>({
    resolver: zodResolver(affectationSchema),
  });

  useEffect(() => {
    if (!siteActif) return;

    // Les deux listes sont desormais protegees par connexion : on utilise
    // appelApi (qui joint le jeton automatiquement) pour les deux.
    appelApi("/api/materiels", { idSite: siteActif })
      .then((resultat) => setMateriels(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreurServeur("Impossible de charger les materiels"));

    appelApi("/api/utilisateurs", { idSite: siteActif })
      .then((resultat) => setUtilisateurs(Array.isArray(resultat) ? resultat : []))
      .catch(() => setErreurServeur("Impossible de charger les utilisateurs"));
  }, [siteActif]);

  async function onSubmit(values: AffectationFormOutput) {
    setErreurServeur(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/affectations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id_materiel: Number(values.idMateriel),
          id_utilisateur: Number(values.idUtilisateur),
          date_debut: values.dateDebut,
        }),
      });

      if (!res.ok) {
        throw new Error("La creation a echoue");
      }

      router.push("/affectations");
    } catch {
      setErreurServeur("Erreur lors de l'enregistrement. Verifie que le serveur tourne bien.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle affectation</h1>
        <p className="text-muted-foreground">
          Si le materiel choisi est deja affecte a quelqu&apos;un, son ancienne affectation
          sera automatiquement cloturee.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Details de l&apos;affectation</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="idMateriel">Materiel</Label>
              <select
                id="idMateriel"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                {...register("idMateriel")}
                defaultValue=""
              >
                <option value="" disabled>Choisir un materiel</option>
                {materiels.map((m) => (
                  <option key={m.id_materiel} value={m.id_materiel}>
                    {m.code_poste} — {m.marque} {m.modele}
                  </option>
                ))}
              </select>
              {errors.idMateriel && (
                <p className="text-sm text-destructive">{errors.idMateriel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idUtilisateur">Utilisateur</Label>
              <select
                id="idUtilisateur"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                {...register("idUtilisateur")}
                defaultValue=""
              >
                <option value="" disabled>Choisir un utilisateur</option>
                {utilisateurs.map((u) => (
                  <option key={u.id_utilisateur} value={u.id_utilisateur}>
                    {u.nom} ({u.fonction})
                  </option>
                ))}
              </select>
              {errors.idUtilisateur && (
                <p className="text-sm text-destructive">{errors.idUtilisateur.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de debut</Label>
              <Input id="dateDebut" type="date" {...register("dateDebut")} />
              {errors.dateDebut && (
                <p className="text-sm text-destructive">{errors.dateDebut.message}</p>
              )}
            </div>

            {erreurServeur && (
              <p className="text-sm text-destructive">{erreurServeur}</p>
            )}

            <Button type="submit" disabled={isSubmitting}>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}