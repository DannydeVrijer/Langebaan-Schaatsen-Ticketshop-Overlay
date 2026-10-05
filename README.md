# Schaats Ticketshop – prototype

Klikbaar prototype van een **eigen ticketshop** voor de langebaantoernooien in Thialf, in de huisstijl van de [Langebaan Schaats App](https://github.com/DannydeVrijer/Langebaan-Schaats-App) (*Beleef de magie van schaatsen*). De shop is bedoeld als eigen voorkant op de **Paylogic Shopping Service API**: Paylogic blijft de achterkant (voorraad, orders, betalen, e-tickets).

> Dit prototype praat (nog) niet met Paylogic. De API wordt nagebootst met dezelfde datastructuur. De knop **API** rechtsboven laat zien welke Paylogic-aanroep elke klik in het echt zou doen.

## Wat zit erin (v2)

Fictief voorbeeld dat **dezelfde stappen volgt als de huidige Paylogic-shop**, maar mobile first en in de nieuwe huisstijl:

1. **Tickets (startpagina)** – zoals een productpagina op bol.com: direct dagtabbladen met vanaf-prijs en de tickets, gegroepeerd in Staan · Zitten · Beleven · Toegankelijk. Programma, plattegrond en vragen achter een knop. Na de eerste + een toegevoegd-melding met 'handig erbij' (kindticket, parkeren, passe-partout).
2. **Parkeren** – alleen voor de dagen in je mandje.
3. **Mandje** – 20 minuten reservering met herstel na verlopen.
4. **Gegevens** – dezelfde velden als nu, gegroepeerd en met uitleg; postcode + huisnummer vult je adres; bescherming en opt-ins los en uit.
5. **Betalen (simulatie)** → **Bedankt** met agenda, delen en één vervolgaanbod.

Op elk scherm legt de knop **Waarom?** uit wat er anders is dan nu en welke marketingtechniek erachter zit. Zie ook **[VERBETERPUNTEN.md](VERBETERPUNTEN.md)**.

Producten, prijzen en programma komen uit de huidige shop (5 okt 2026). Beschikbaarheid, parkeerterreinen en quotes (magievanschaatsen.nl) zijn voorbeeld. Placeholders staan tussen `[ ]`.

v1 (API-prototype met plattegrond-eerst en BFF-schets) staat in de git-geschiedenis; [ARCHITECTUUR.md](ARCHITECTUUR.md) en `server/bff.mjs` blijven geldig voor een echte koppeling.

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
src/data/event.ts     event, programma, producten, prijzen, parkeren, quotes
src/data/why.ts       "Waarom?"-toelichting per scherm (met bronnen)
src/state.tsx         mandje + echte 20-minutenreservering
src/components/       ThialfMap, UI (kop, stappen, stepper, onderblad, actiebalk)
src/screens/          Home, Day, Parking, Cart, Checkout, Pay (simulatie), Thanks
```
