const CLE_MESSAGE = "message_succes";

export function afficherSucces(message: string) {
  try {
    sessionStorage.setItem(CLE_MESSAGE, message);
  } catch {
    // on ignore si le navigateur refuse
  }
  window.dispatchEvent(new Event("notification-succes"));
}

export function lireEtEffacerSucces(): string | null {
  try {
    const message = sessionStorage.getItem(CLE_MESSAGE);
    if (message) sessionStorage.removeItem(CLE_MESSAGE);
    return message;
  } catch {
    return null;
  }
}