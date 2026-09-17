"use client";

// Composant client (interactif) séparé de la page liste (qui reste un composant serveur).
// Nécessaire car cliquer sur un bouton et appeler l'API ne peut se faire que côté client.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RetirerAffectationButton({ idAffecter }: { idAffecter: number }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function handleRetirer() {
    setEnCours(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/affectations/${idAffecter}/retirer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Erreur lors du retrait");
      }
      router.refresh();
    } catch {
      alert("Erreur lors du retrait du matériel. Vérifie que le serveur tourne bien.");
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