"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Eye, EyeOff } from "lucide-react";
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
import { ElectricPatternBackground } from "@/components/electric-pattern-bg";

const loginSchema = z.object({
  identifiant: z.string().min(1, "Identifiant requis"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setErreur(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifiant: values.identifiant,
          mot_de_passe: values.motDePasse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Connexion impossible");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("profil", data.profil.toLowerCase());
      localStorage.setItem("identifiant", data.identifiant);
      localStorage.setItem("id_site", data.id_site ?? "");

      router.push("/dashboard");
    } catch {
      setErreur("Impossible de contacter le serveur. Vérifie qu'il tourne bien.");
    }
  }

  return (
    // "relative" ici est indispensable : c'est ce qui permet au motif de fond
    // (positionne en "absolute" a l'interieur) de bien se placer derriere le
    // contenu, sans se retrouver cache derriere le fond de la page.
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <ElectricPatternBackground />
      {/* z-10 place ce bloc au-dessus du motif de fond */}
      <div className="relative z-10 w-full max-w-sm space-y-6">
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
                <div className="relative">
                  <Input
                    id="motDePasse"
                    type={motDePasseVisible ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-9"
                    {...register("motDePasse")}
                  />
                  <button
                    type="button"
                    onClick={() => setMotDePasseVisible((v) => !v)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {motDePasseVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
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
    </div>
  );
}