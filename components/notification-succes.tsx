"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { lireEtEffacerSucces } from "@/lib/notification";

// Bandeau vert en haut a droite, qui disparait tout seul apres 5 secondes.
export function NotificationSucces() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function verifier() {
      const nouveau = lireEtEffacerSucces();
      if (nouveau) setMessage(nouveau);
    }

    verifier();
    window.addEventListener("notification-succes", verifier);
    return () => window.removeEventListener("notification-succes", verifier);
  }, []);

  useEffect(() => {
    if (!message) return;
    const minuteur = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(minuteur);
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-lg bg-success px-4 py-3 text-success-foreground shadow-lg">
      <CheckCircle2 className="size-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="ml-2 shrink-0 opacity-80 hover:opacity-100"
        aria-label="Fermer"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}