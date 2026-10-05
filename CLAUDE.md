# Projectregels – Schaats Ticketshop

Volgt de regels van de Langebaan Schaats App (mobile first, MVS-huisstijl, NL je-vorm):
- Eerst testen op 390×844 en 360×800; tikdoelen ≥ 44 px; geen hover-afhankelijke interacties.
- Kleuren en maten alleen via tokens in `src/styles.css`. Prijzen in de bodyfont (Sportize heeft geen goed €-teken).
- Content per toernooi/vak in `src/data/`, niet in schermen. Placeholders tussen `[ ]`.
- Volgt de stappen van de Paylogic-shop (tickets → parkeren → mandje → gegevens → betalen). Bij een echte koppeling praat de browser nooit direct met Paylogic: via een BFF (zie ARCHITECTUUR.md).
- Marketing: eerlijk. Geen nep-schaarste, verzonnen reviews of vooraf aangevinkte extra's. Nieuwe technieken toevoegen aan `src/data/why.ts` met bron.
- Na elke wijziging moet `npm run build` slagen. Commits in het Nederlands.
