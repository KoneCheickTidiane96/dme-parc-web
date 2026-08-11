"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const materielSchema = z.object({
  codePoste: z.string().min(1, "Code poste requis"),
  ciEntite: z.string().min(1, "Entite requise"),
  marqueModele: z.string().min(1, "Marque / modele requis"),
  numeroSerie: z.string().min(1, "Numero de serie requis"),
  ramMo: z.coerce.number().int().nonnegative(),
  ddGo: z.coerce.number().int().nonnegative(),
  dateAchat: z.string().min(1, "Date d'achat requise"),
});

type MaterielFormInput = z.input<typeof materielSchema>;
type MaterielFormOutput = z.output<typeof materielSchema>;

export default function NouveauMaterielPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaterielFormInput, unknown, MaterielFormOutput>({
    resolver: zodResolver(materielSchema),
  });

  async function onSubmit(values: MaterielFormOutput) {
    // TODO: POST vers l'API Laravel + controle d'unicite (numero de serie, code poste).
    void values;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle fiche materiel</h1>
        <p className="text-muted-foreground">
          Type de matériel, statut, site/emplacement et référentiels seront des listes déroulantes
          alimentées par l&apos;API une fois branchée.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations principales</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="codePoste">Code poste</Label>
              <Input id="codePoste" {...register("codePoste")} />
              {errors.codePoste && (
                <p className="text-sm text-destructive">{errors.codePoste.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciEntite">Entite (CI)</Label>
              <Input id="ciEntite" {...register("ciEntite")} />
              {errors.ciEntite && (
                <p className="text-sm text-destructive">{errors.ciEntite.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="marqueModele">Marque / Modele</Label>
              <Input id="marqueModele" {...register("marqueModele")} />
              {errors.marqueModele && (
                <p className="text-sm text-destructive">{errors.marqueModele.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="numeroSerie">Numero de serie</Label>
              <Input id="numeroSerie" {...register("numeroSerie")} />
              {errors.numeroSerie && (
                <p className="text-sm text-destructive">{errors.numeroSerie.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ramMo">RAM (Mo)</Label>
              <Input id="ramMo" type="number" {...register("ramMo")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ddGo">Disque dur (Go)</Label>
              <Input id="ddGo" type="number" {...register("ddGo")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dateAchat">Date d&apos;achat</Label>
              <Input id="dateAchat" type="date" {...register("dateAchat")} />
              {errors.dateAchat && (
                <p className="text-sm text-destructive">{errors.dateAchat.message}</p>
              )}
            </div>
            <Button type="submit" className="sm:col-span-2" disabled={isSubmitting}>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
