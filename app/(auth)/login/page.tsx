"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  identifiant: z.string().min(1, "Identifiant requis"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [erreur, setErreur] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit() {
    // TODO: appeler l'API Laravel (POST /login) une fois le mecanisme d'auth choisi.
    setErreur("Connexion pas encore branchee a l'API.");
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Zap className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Parc informatique DME</p>
          <p className="text-xs text-muted-foreground">CIE — Abidjan-Plateau &amp; Yamoussoukro</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connectez-vous avec votre compte applicatif.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="identifiant">Identifiant</Label>
              <Input id="identifiant" autoComplete="username" {...register("identifiant")} />
              {errors.identifiant && (
                <p className="text-sm text-destructive">{errors.identifiant.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motDePasse">Mot de passe</Label>
              <Input
                id="motDePasse"
                type="password"
                autoComplete="current-password"
                {...register("motDePasse")}
              />
              {errors.motDePasse && (
                <p className="text-sm text-destructive">{errors.motDePasse.message}</p>
              )}
            </div>
            {erreur && <p className="text-sm text-destructive">{erreur}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
