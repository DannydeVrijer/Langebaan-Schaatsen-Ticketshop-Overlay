# Schaats Ticketshop – prototype

Klikbaar prototype van een **eigen ticketshop** voor de langebaantoernooien in Thialf, in de huisstijl van de [Langebaan Schaats App](https://github.com/DannydeVrijer/Langebaan-Schaats-App) (*Beleef de magie van schaatsen*). De shop is bedoeld als eigen voorkant op de **Paylogic Shopping Service API**: Paylogic blijft de achterkant (voorraad, orders, betalen, e-tickets).

> Dit prototype praat (nog) niet met Paylogic. De API wordt nagebootst met dezelfde datastructuur. De knop **API** rechtsboven laat zien welke Paylogic-aanroep elke klik in het echt zou doen.

## Wat zit erin

- **Toernooien** – de 5 NL-toernooien uit schaatsen.nl. Alleen het **WCKT (30 okt – 1 nov 2026)** is gevuld met de echte producten en prijzen uit de huidige shop (opgehaald 5 okt 2026).
- **Dagkeuze** met "vanaf"-prijs per dag en passe-partout.
- **Interactieve plattegrond van Thialf**: tik op een vak (Noord/Zuid-bocht, West, Oost, VIP, mindervaliden). Uitverkochte vakken zijn uitgegrijsd.
- **Per vak eigen content** (pitch, USP's) – staat niet in Paylogic, dit is de winst van een eigen voorkant.
- **Slimme passe-partout-tip**: kies je hetzelfde vak op 2+ dagen, dan rekent de shop het verschil uit en zet hij het met één tik om.
- **Parkeren als upsell** voor precies de dagen in je mandje.
- **Wachtlijst-knop** bij uitverkochte producten (placeholder).
- **Afrekenen in één scherm**: prijscheck bij Paylogic (`/bill`), gegevens, betaalmethode.
- **Betaalovergang (simulatie)** – in het echt gaat de koper hier naar de betaalpagina van Paylogic en komt hij via `redirect_url` terug.
- **Bevestiging** met agenda-bestand (.ics) en link naar de schaatsapp.
- **Fallback-link** naar de standaard Paylogic-shop op elke shoppagina.

## Lokaal draaien

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # productie-build in dist/
```

Online via GitHub Pages: `https://dannydevrijer.github.io/schaats-ticketshop/` (eenmalig: *Settings → Pages → Source: GitHub Actions*).

## Naar een echte koppeling

Zie **[ARCHITECTUUR.md](ARCHITECTUUR.md)**: wat bij jullie draait, wat bij Paylogic blijft, wat er nog gebouwd moet worden en de risico's.

## Structuur

```
src/api/types.ts      types volgens de Paylogic Shopping API (vereenvoudigd)
src/api/mockData.ts   events + WCKT-producten/prijzen (uit de huidige shop)
src/api/client.ts     API-laag: mock of echte BFF (VITE_API_BASE), logt elke aanroep
src/data/zones.ts     eigen content per vak en per dag
src/components/       ThialfMap (plattegrond), ApiPanel, UI uit de app
src/screens/          Events, Shop, Checkout, Payment (simulatie), Done
server/bff.mjs        voorbeeld-server die de Paylogic-sleutel bewaart (niet getest)
```

Placeholders staan tussen `[ ]`.
