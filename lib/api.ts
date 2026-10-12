// Adresse de base de l'API back-end. Lue depuis la variable d'environnement
// NEXT_PUBLIC_API_URL (definie dans .env.local), avec localhost:5000 comme
// valeur de secours si elle n'est pas definie. C'est le SEUL endroit du
// front-end ou cette adresse est ecrite en dur — toutes les pages doivent
// l'importer d'ici plutot que de retaper "http://localhost:5000" elles-memes.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface OptionsAppel {
  methode?: "GET" | "POST" | "PUT" | "DELETE";
  corps?: unknown;
  idSite?: string | null;
}

export async function appelApi(chemin: string, options: OptionsAppel = {}) {
  const token = localStorage.getItem("token");

  const url = new URL(API_BASE_URL + chemin);
  if (options.idSite) {
    url.searchParams.set("id_site", options.idSite);
  }

  const reponse = await fetch(url.toString(), {
    method: options.methode ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.corps ? JSON.stringify(options.corps) : undefined,
  });

  if (!reponse.ok) {
    const erreur = await reponse.json().catch(() => ({}));
    throw new Error(erreur.erreur || "Erreur lors de l'appel à l'API");
  }

  return reponse.json();
}