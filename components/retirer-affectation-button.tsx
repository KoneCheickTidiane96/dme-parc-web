"use client";

// Composant client (interactif) : bouton pour retirer une affectation.
// Il utilise appelApi, qui s'occupe de l'adresse du serveur et du jeton de connexion.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { appelApi } from "@/lib/api";

export function RetirerAffectationButton({ idAffecter }: { idAffecter: number }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  // Termine l'affectation (le materiel redevient disponible)
  async function handleRetirer() {
    setEnCours(true);
    try {
      await appelApi(`/api/affectations/${idAffecter}/retirer`, {
        methode: "PUT",
        corps: {},
      });
      router.refresh();
      // Message de confirmation
      toast.success("Matériel retiré avec succès");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du retrait du matériel.";
      toast.error(message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRetirer} disabled={enCours}>
      {enCours ? "..." : "Retirer"}
    </Button>
  );
}