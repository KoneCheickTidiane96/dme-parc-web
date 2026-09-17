"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CompteApplicatif } from "@/lib/types";

interface AuthContextValue {
  user: CompteApplicatif | null;
  setUser: (user: CompteApplicatif | null) => void;
  logout: () => void;
  pret: boolean;
  siteActif: string | null;
  changerSiteActif: (idSite: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CompteApplicatif | null>(null);
  const [siteActif, setSiteActifState] = useState<string | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const identifiant = localStorage.getItem("identifiant");
    const profil = localStorage.getItem("profil");
    const idSite = localStorage.getItem("id_site");
    const siteChoisi = localStorage.getItem("site_actif");

    if (identifiant && profil) {
      setUser({
        id_compte: "",
        identifiant,
        profil: profil as CompteApplicatif["profil"],
        id_site: idSite && idSite !== "null" ? idSite : null,
      });

      if (profil === "gestionnaire" && idSite && idSite !== "null") {
        setSiteActifState(idSite);
      } else if (profil === "administrateur" && siteChoisi) {
        setSiteActifState(siteChoisi);
      }
    }

    setPret(true);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("identifiant");
    localStorage.removeItem("profil");
    localStorage.removeItem("id_site");
    localStorage.removeItem("site_actif");
    setUser(null);
    setSiteActifState(null);
  }

  function changerSiteActif(idSite: string) {
    setSiteActifState(idSite);
    localStorage.setItem("site_actif", idSite);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, pret, siteActif, changerSiteActif }}>
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