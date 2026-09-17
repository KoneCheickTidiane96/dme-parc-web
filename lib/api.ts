// Fonction utilitaire pour appeler l'API back-end en y joignant automatiquement
// le jeton de connexion (JWT) sauvegarde lors du login. Sans ce jeton, les
// routes protegees du serveur repondent desormais "401 Connexion requise".

const API_BASE = "http://localhost:5000";

interface OptionsAppel {
  methode?: "GET" | "POST" | "PUT" | "DELETE";
  corps?: unknown;
  // Site a consulter (utile pour un Administrateur qui a choisi un site
  // via le badge de bascule). Ignore cote serveur si l'utilisateur est
  // Gestionnaire (son site est impose automatiquement).
  idSite?: string | null;
}

export async function appelApi(chemin: string, options: OptionsAppel = {}) {
  const token = localStorage.getItem("token");

  const url = new URL(API_BASE + chemin);
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