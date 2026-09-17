"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

const utilisateurSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  fonction: z.string().min(1, "Fonction requise"),
  matricule: z.string().min(1, "Matricule requis"),
});

type UtilisateurFormInput = z.input<typeof utilisateurSchema>;
type UtilisateurFormOutput = z.output<typeof utilisateurSchema>;

export default function NouvelUtilisateurPage() {
  const router = useRouter();
  // Le site actif (choisi via le badge en haut de l'ecran) sert directement
  // a determiner ou l'utilisateur sera cree — pas besoin de le redemander
  // dans le formulaire, puisqu'on sait deja sur quel site on se trouve.
  const { siteActif } = useAuth();
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UtilisateurFormInput, unknown, UtilisateurFormOutput>({
    resolver: zodResolver(utilisateurSchema),
  });

  async function onSubmit(values: UtilisateurFormOutput) {
    setErreurServeur(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/utilisateurs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nom: values.nom,
          fonction: values.fonction,
          matricule: values.matricule,
          // Le site actuellement affiche (badge) est utilise directement
          id_site: siteActif ? Number(siteActif) : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("La creation a echoue");
      }

      router.push("/admin/utilisateurs");
    } catch {
      setErreurServeur("Erreur lors de l'enregistrement. Verifie que le serveur tourne bien.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvel utilisateur</h1>
        <p className="text-muted-foreground">
          Ajoute un agent de la DME auquel du materiel pourra etre affecte.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" {...register("nom")} />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fonction">Fonction</Label>
              <Input id="fonction" {...register("fonction")} />
              {errors.fonction && (
                <p className="text-sm text-destructive">{errors.fonction.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input id="matricule" {...register("matricule")} />
              {errors.matricule && (
                <p className="text-sm text-destructive">{errors.matricule.message}</p>
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