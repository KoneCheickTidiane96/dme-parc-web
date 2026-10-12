"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { API_BASE_URL, appelApi } from "@/lib/api";

// Regles de validation du formulaire
const materielSchema = z.object({
  codePoste: z.string().min(1, "Code poste requis"),
  ciEntite: z.string().min(1, "Entite requise"),
  marque: z.string().min(1, "Marque requise"),
  modele: z.string().min(1, "Modele requis"),
  numeroSerie: z.string().min(1, "Numero de serie requis"),
  dateAchat: z.string().min(1, "Date d'achat requise"),
  idStatut: z.string().min(1, "Statut requis"),
  idTypeMateriel: z.string().min(1, "Type requis"),
  ramMo: z.string().optional(),
  ddGo: z.string().optional(),
});

type MaterielFormInput = z.input<typeof materielSchema>;
type MaterielFormOutput = z.output<typeof materielSchema>;

interface Statut {
  id_statut: number;
  libelle_statut: string;
}

interface TypeMateriel {
  id_type_materiel: number;
  libelle_type_materiel: string;
  duree_vie_standard_annees: number | null;
}

export default function NouveauMaterielPage() {
  const router = useRouter();
  const { siteActif } = useAuth();
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [types, setTypes] = useState<TypeMateriel[]>([]);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaterielFormInput, unknown, MaterielFormOutput>({
    resolver: zodResolver(materielSchema),
  });

  // Chargement des listes de statuts et de types de materiel
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/statuts`)
      .then((res) => res.json())
      .then(setStatuts)
      .catch(() => setErreurServeur("Impossible de charger les statuts"));

    fetch(`${API_BASE_URL}/api/types-materiel`)
      .then((res) => res.json())
      .then(setTypes)
      .catch(() => setErreurServeur("Impossible de charger les types de matériel"));
  }, []);

  const idTypeChoisi = watch("idTypeMateriel");

  // Duree de vie du type choisi (appliquee automatiquement)
  const dureeAssociee = useMemo(() => {
    const type = types.find((t) => String(t.id_type_materiel) === idTypeChoisi);
    return type?.duree_vie_standard_annees ?? null;
  }, [idTypeChoisi, types]);

  // Appele quand le formulaire est incomplet
  function onInvalid() {
    toast.error("Formulaire incomplet : verifie les champs en rouge.");
  }

  // Envoi du formulaire : creation du materiel
  async function onSubmit(values: MaterielFormOutput) {
    setErreurServeur(null);

    if (dureeAssociee === null) {
      const message =
        "Ce type de matériel n'a pas de durée de vie définie. Contacte un administrateur.";
      setErreurServeur(message);
      toast.error(message);
      return;
    }

    try {
      await appelApi("/api/materiels", {
        methode: "POST",
        idSite: siteActif,
        corps: {
          code_poste: values.codePoste,
          ci_entite: values.ciEntite,
          marque: values.marque,
          modele: values.modele,
          numero_serie: values.numeroSerie,
          date_achat: values.dateAchat,
          id_statut: Number(values.idStatut),
          id_type_materiel: Number(values.idTypeMateriel),
          duree_amortissement: dureeAssociee,
          id_site: siteActif ? Number(siteActif) : undefined,
          ram_mo: values.ramMo ? Number(values.ramMo) : null,
          dd_go: values.ddGo ? Number(values.ddGo) : null,
        },
      });

      // Message de confirmation, visible aussi sur la page suivante
      toast.success("Matériel ajouté avec succès");
      router.push("/materiels");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      setErreurServeur(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle fiche materiel</h1>
        <p className="text-muted-foreground">
          Renseigne les informations du matériel à enregistrer dans le parc.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations principales</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
          >
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
            <div className="space-y-2">
              <Label htmlFor="marque">Marque</Label>
              <Input id="marque" {...register("marque")} />
              {errors.marque && (
                <p className="text-sm text-destructive">{errors.marque.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modele">Modele</Label>
              <Input id="modele" {...register("modele")} />
              {errors.modele && (
                <p className="text-sm text-destructive">{errors.modele.message}</p>
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

            <div className="space-y-2">
              <Label htmlFor="idStatut">Statut</Label>
              <select
                id="idStatut"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                {...register("idStatut")}
                defaultValue=""
              >
                <option value="" disabled>Choisir un statut</option>
                {statuts.map((s) => (
                  <option key={s.id_statut} value={s.id_statut}>
                    {s.libelle_statut}
                  </option>
                ))}
              </select>
              {errors.idStatut && (
                <p className="text-sm text-destructive">{errors.idStatut.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idTypeMateriel">Type de materiel</Label>
              <select
                id="idTypeMateriel"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                {...register("idTypeMateriel")}
                defaultValue=""
              >
                <option value="" disabled>Choisir un type</option>
                {types.map((t) => (
                  <option key={t.id_type_materiel} value={t.id_type_materiel}>
                    {t.libelle_type_materiel}
                  </option>
                ))}
              </select>
              {errors.idTypeMateriel && (
                <p className="text-sm text-destructive">{errors.idTypeMateriel.message}</p>
              )}
            </div>

            {idTypeChoisi && (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                {dureeAssociee !== null
                  ? `Durée de vie associée à ce type : ${dureeAssociee} an(s) (appliquée automatiquement).`
                  : "Ce type de matériel n'a pas encore de durée de vie définie."}
              </p>
            )}

            {erreurServeur && (
              <p className="text-sm text-destructive sm:col-span-2">{erreurServeur}</p>
            )}

            <Button type="submit" className="sm:col-span-2" disabled={isSubmitting}>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}