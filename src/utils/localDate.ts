// accountingDate est traité dans toute l'app comme une heure locale "naïve"
// (sans offset de fuseau), au format attendu par <input type="datetime-local">.
// new Date().toISOString() renvoie de l'UTC (suffixe "Z"), ce qui décale
// l'heure une fois réinterprété côté backend (ex: perte de 2h en CEST).
// Ces helpers convertissent une Date vers cette convention locale naïve.

/** "YYYY-MM-DDTHH:mm:ss.sss" en heure locale, sans offset ni suffixe "Z". */
export const toNaiveLocalIso = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1);

/** "YYYY-MM-DDTHH:mm" en heure locale, format attendu par <input type="datetime-local">. */
export const toLocalInputValue = (date: Date): string => toNaiveLocalIso(date).slice(0, 16);
