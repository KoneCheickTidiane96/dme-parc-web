"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appelApi, API_BASE_URL } from "@/lib/api";

// Regles de validation du formulaire
const materielSchema = z.object({
  codePoste: z.string().min(1, "Code poste requis"),
  ciEntite: z.string().optional(),
  marque: z.string().min(1, "Marque requise"),
  modele: z.string().min(1, "Modele requis"),
  numeroSerie: z.string().min(1, "Numero de serie requis"),
  dateAchat: z.string().min(1, "Date d'achat requise"),
  idStatut: z.string().min(1, "Statut requis"),
  idTypeMateriel: z.string().min(1, "Type requis"),
  ramMo: z.string().optional(),
  ddGo: z.string().optional(),
  observation: z.string().optional(),
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
}

interface MaterielDetail {
  id_materiel: number;
  code_poste: string;
  ci_entite: string | null;
  marque: string;
  modele: string;
  numero_serie: string;
  date_achat: string;
  observation: string | null;
  ram_mo: number | null;
  dd_go: number | null;
  id_statut: number;
  id_type_materiel: number;
}

// Convertit une date du serveur en format accepte par <input type="date">
function versDateInput(date: string): string {
  return date ? date.slice(0, 10) : "";
}

export default function ModifierMaterielPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [types, setTypes] = useState<TypeMateriel[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterielFormInput, unknown, MaterielFormOutput>({
    resolver: zodResolver(materielSchema),
  });

  // Chargement des listes et des informations actuelles du materiel
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/statuts`)
      .then((res) => res.json())
      .then(setStatuts)
      .catch(() => setErreurServeur("Impossible de charger les statuts"));

    fetch(`${API_BASE_URL}/api/types-materiel`)
      .then((res) => res.json())
      .then(setTypes)
      .catch(() => setErreurServeur("Impossible de charger les types"));

    appelApi(`/api/materiels/${id}`)
      .then((m: MaterielDetail) => {
        reset({
          codePoste: m.code_poste,
          ciEntite: m.ci_entite ?? "",
          marque: m.marque,
          modele: m.modele,
          numeroSerie: m.numero_serie,
          dateAchat: versDateInput(m.date_achat),
          idStatut: String(m.id_statut),
          idTypeMateriel: String(m.id_type_materiel),
          ramMo: m.ram_mo ? String(m.ram_mo) : "",
          ddGo: m.dd_go ? String(m.dd_go) : "",
          observation: m.observation ?? "",
        });
      })
      .catch(() => setErreurServeur("Impossible de charger ce matériel"))
      .finally(() => setChargement(false));
  }, [id, reset]);

  // Appele quand le formulaire est incomplet
  function onInvalid() {
    toast.error("Formulaire incomplet : verifie les champs en rouge.");
  }

  // Envoi du formulaire : modification du materiel
  async function onSubmit(values: MaterielFormOutput) {
    setErreurServeur(null);
    try {
      await appelApi(`/api/materiels/${id}`, {
        methode: "PUT",
        corps: {
          code_poste: values.codePoste,
          ci_entite: values.ciEntite || null,
          marque: values.marque,
          modele: values.modele,
          numero_serie: values.numeroSerie,
          date_achat: values.dateAchat,
          id_statut: Number(values.idStatut),
          id_type_materiel: Number(values.idTypeMateriel),
          ram_mo: values.ramMo ? Number(values.ramMo) : null,
          dd_go: values.ddGo ? Number(values.ddGo) : null,
          observation: values.observation || null,
        },
      });

      // Message de confirmation, visible aussi sur la liste
      toast.success("Matériel modifié avec succès");
      router.push("/materiels");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la modification.";
      setErreurServeur(message);
      toast.error(message);
    }
  }

  if (chargement) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Modifier le matériel</h1>
        <p className="text-muted-foreground">
          Mets à jour les informations de cette fiche matériel.
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
              >
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
              >
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="observation">Observation</Label>
              <Input id="observation" {...register("observation")} />
            </div>

            {erreurServeur && (
              <p className="text-sm text-destructive sm:col-span-2">{erreurServeur}</p>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                Enregistrer les modifications
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/materiels")}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}