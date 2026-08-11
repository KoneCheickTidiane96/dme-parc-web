"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CompteApplicatif } from "@/lib/types";

// TODO: brancher sur l'API Laravel une fois le mode d'auth choisi (Sanctum token vs cookie SPA).
// Pour l'instant ce contexte tient juste l'utilisateur courant cote client, sans appel reseau.

interface AuthContextValue {
  user: CompteApplicatif | null;
  setUser: (user: CompteApplicatif | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CompteApplicatif | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit etre utilise a l'interieur d'un AuthProvider");
  }
  return context;
}
