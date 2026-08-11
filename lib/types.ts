// Modele de domaine — voir cahier des charges section 7 (Modele de donnees propose)

export type ProfilUtilisateur = "administrateur" | "gestionnaire" | "consultation";

export type NomSite = "Abidjan-Plateau" | "NDY";

export interface Site {
  id_site: string;
  nom_site: NomSite;
  adresse: string;
}

export interface Emplacement {
  id_emplacement: string;
  id_site: string;
  libelle: string;
}

export interface TypeMateriel {
  id_type: string;
  libelle: string;
  duree_vie_standard_annees: number;
}

export interface Statut {
  id_statut: string;
  libelle: string;
}

export interface Utilisateur {
  id_utilisateur: string;
  nom: string;
  fonction: string;
  service: string;
}

export interface Materiel {
  id_materiel: string;
  code_poste: string;
  ci_entite: string;
  id_type: string;
  marque_modele: string;
  numero_serie: string;
  ram_mo: number;
  dd_go: number;
  date_achat: string;
  age_calcule_annees: number;
  date_renouvellement: string;
  id_statut: string;
  id_emplacement: string;
  observation: string | null;
  remplace_id_materiel: string | null;
  archive: boolean;
}

export interface Affectation {
  id_affectation: string;
  id_materiel: string;
  id_utilisateur: string;
  date_debut: string;
  date_fin: string | null;
}

export interface HistoriqueMateriel {
  id_historique: string;
  id_materiel: string;
  champ_modifie: string;
  ancienne_valeur: string;
  nouvelle_valeur: string;
  date_modification: string;
  id_compte_appli: string;
}

export interface CompteApplicatif {
  id_compte: string;
  identifiant: string;
  profil: ProfilUtilisateur;
  id_site: string | null;
}

export interface IndicateursDashboard {
  total_materiel: number;
  age_moyen_annees: number;
  repartition_par_type: { libelle: string; count: number }[];
  repartition_par_statut: { libelle: string; count: number }[];
  repartition_par_site: { nom_site: NomSite; count: number }[];
  a_renouveler_court_terme: number;
}
