/** Pad naar een bestand in public/, rekening houdend met de base path (GitHub Pages). */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '');
