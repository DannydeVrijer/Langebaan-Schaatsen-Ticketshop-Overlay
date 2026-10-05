# Projectregels – Schaats Ticketshop

Volgt de regels van de Langebaan Schaats App (mobile first, MVS-huisstijl, NL je-vorm):
- Eerst testen op 390×844 en 360×800; tikdoelen ≥ 44 px; geen hover-afhankelijke interacties.
- Kleuren en maten alleen via tokens in `src/styles.css`. Prijzen in de bodyfont (Sportize heeft geen goed €-teken).
- Content per toernooi/vak in `src/data/`, niet in schermen. Placeholders tussen `[ ]`.
- De browser praat nooit direct met Paylogic: alles via `src/api/client.ts` → BFF.
- Na elke wijziging moet `npm run build` slagen. Commits in het Nederlands.
