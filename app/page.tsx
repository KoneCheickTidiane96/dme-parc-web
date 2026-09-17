import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Laptop, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ElectricPatternBackground } from "@/components/electric-pattern-bg";

export default function AccueilPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-16">
      <ElectricPatternBackground />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Logo CIE */}
        <div className="mb-6 flex size-24 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
          <Image
            src="/cie-logo.png"
            alt="Logo CIE"
            width={80}
            height={80}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Parc informatique DME
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Compagnie Ivoirienne d&apos;Électricité — Direction des Mouvements d&apos;Énergie
        </p>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Application de gestion et de suivi du parc micro-informatique, pour les sites
          d&apos;Abidjan-Plateau et de Yamoussoukro (NDY).
        </p>

        <Button size="lg" className="mt-8" render={<Link href="/login">Accéder à l&apos;application<ArrowRight /></Link>} />

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="items-center text-center">
              <Laptop className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">Suivi du parc</CardTitle>
              <CardDescription>Matériel, affectations et statuts en temps réel.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <ShieldCheck className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">Accès sécurisé</CardTitle>
              <CardDescription>Comptes par profil, données cloisonnées par site.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <BarChart3 className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">Tableau de bord</CardTitle>
              <CardDescription>Indicateurs et alertes de renouvellement.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}