export const debug = (title: string, payload?: any) => {
  // Actif seulement si la page possède ?debugIPE=1
  const urlFlag = new URLSearchParams(window.location.search).get("debugIPE") === "1";
  if (!urlFlag) return;

  const prefix = "🟦 [IPE-Widget]";
  if (payload !== undefined) {
    console.groupCollapsed(`${prefix} ${title}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log(`${prefix} ${title}`);
  }
};
