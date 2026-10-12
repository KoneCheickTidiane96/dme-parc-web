"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { ElectricPatternBackground } from "@/components/electric-pattern-bg";

export default function LoginPage() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant, mot_de_passe: motDePasse }),
      });

      const resultat = await res.json();

      if (!res.ok) {
        throw new Error(resultat?.erreur || "Identifiant ou mot de passe incorrect");
      }

      // On enregistre les informations de connexion dans le navigateur.
      // Cette page n'utilise volontairement pas useAuth() : elle est en
      // dehors de la zone couverte par AuthProvider. Une fois arrive sur
      // /dashboard, AuthProvider relit ces valeurs tout seul.
      localStorage.setItem("token", resultat.token);
      localStorage.setItem("identifiant", resultat.identifiant);
      localStorage.setItem("profil", resultat.profil);
      localStorage.setItem("id_site", resultat.id_site ?? "null");

      router.push("/dashboard");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4">
      <ElectricPatternBackground />
      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">Parc informatique DME</h1>
          <p className="text-sm text-muted-foreground">CIE - Abidjan-Plateau &amp; Yamoussoukro</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous avec votre compte applicatif.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="identifiant">Identifiant</Label>
                <Input
                  id="identifiant"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motDePasse">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="motDePasse"
                    type={afficherMotDePasse ? "text" : "password"}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    autoComplete="current-password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setAfficherMotDePasse((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                  >
                    {afficherMotDePasse ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {erreur && <p className="text-sm text-destructive">{erreur}</p>}

              <Button type="submit" className="w-full" disabled={enCours}>
                {enCours ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}