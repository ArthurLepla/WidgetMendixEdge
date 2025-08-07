export const debug = (title: string, payload?: any) => {
  // ➜ Actif seulement si le widget est en DevMode OU si la page possède ?debugIPE=1
  const urlFlag = new URLSearchParams(window.location.search).get("debugIPE") === "1";
  if (!urlFlag && process.env.NODE_ENV === "production") return;

  // Préfixe spécial pour le mode dev
  const isDevMode = process.env.NODE_ENV === "development";
  const prefix = isDevMode ? "🟨 [IPE-Widget-DEV]" : "🟦 [IPE-Widget]";

  if (payload !== undefined) {
    console.groupCollapsed(`${prefix} ${title}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log(`${prefix} ${title}`);
  }
};
