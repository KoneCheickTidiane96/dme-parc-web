// Fonctions de formatage reutilisables dans toute l'application

// Convertit une date (ISO, ou objet Date) en format jour/mois/annee (ex: 15/03/2024)
// Retourne "-" si la date est vide ou invalide, plutot que de planter l'affichage
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const jour = String(d.getDate()).padStart(2, "0");
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const annee = d.getFullYear();

  return `${jour}/${mois}/${annee}`;
}