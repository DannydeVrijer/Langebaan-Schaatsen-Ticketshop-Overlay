# De shop koppelen aan de Paylogic Shopping API

Stappenplan om van het fictieve voorbeeld een echte shop te maken. Gebaseerd op https://shopping-api-docs.paylogic.com/ (gelezen 29 okt 2026). Het API-skelet staat in `src/api/paylogic.ts`.

## Hoe het werkt

Paylogic blijft de achterkant: producten, voorraad, prijzen, betalen, e-tickets, personalisatie, refunds. Onze shop is alleen de voorkant en praat met vier aanroepen:

| Stap in de shop | Aanroep | Wat je terugkrijgt |
|---|---|---|
| Dag/plek kiezen | `GET /storefront?event=…&country=NL` | Alle producten met prijs (incl./excl. servicekosten), `is_sold_out`, min/max per order |
| Mandje / afrekenen | `POST /bill` met producten + land | Definitief totaal, `available_payment_methods` (iDEAL, …) en welke klantvelden elke betaalmethode verplicht stelt |
| Betalen | `POST /orders` | Order met `_links.payment`: daarheen stuur je de koper |
| Terugkomst op `redirect_url` | `GET /orders/{uid}` | `status`: `pending` / `completed` / `canceled`; bij completed `shop:etickets` |

Betalen gebeurt dus altijd op de betaalpagina van Paylogic. Onze "simulatie"-stap wordt een echte doorverwijzing.

## Stap 1 – Toegang aanvragen bij Paylogic / Eventim

Vraag je Client Success Manager om:

1. **Een Bearer-token voor de frontend.** Dit is een door Paylogic ondertekende JWT met beperkte rechten (rol `spa-sales`: events en producten lezen, bill, order aanmaken). Die mag in de browser staan. Dit is de makkelijkste route: de shop kan dan rechtstreeks vanaf GitHub Pages met de API praten, zonder eigen server.
2. **Niet** de Basic-credentials (app-id + secret) gebruiken in de browser. De docs zeggen dat expliciet. Die zijn alleen voor een server (zie stap 6).
3. **Sandbox-toegang** om te testen zonder echte betalingen (`shopping-api-docs.sandbox.paylogic.com` bestaat; vraag de bijbehorende API-URL en test-event).
4. **De event-uid** van het toernooi (staat ook in de shop-URL: `tickets.schaatsen.nl/7ea4c49ff00f41d3acc549e0fdab376f/…`).
5. Bevestiging of API-verkoop onder jullie contract valt en wat de kosten zijn.

## Stap 2 – Producten koppelen aan de indeling van de shop

Paylogic kent alleen producten ("Ireen Wüst bocht - Noord - kids - 31 okt"). De shop kent dag, vak en doelgroep. Die koppeling leg je zelf vast in `productMeta` in `src/api/paylogic.ts`:

```ts
'<product-uid>': { day: 'za', zone: 'noord', audience: 'kids' },
```

De uid's vind je in de backoffice of in de storefront-respons (`_embedded["shop:product"]`). Producten zonder koppeling worden overgeslagen en gelogd. Advies: gebruik een vaste naamgeving in de backoffice zodat dit op termijn automatisch kan.

Parkeren zit in dezelfde storefront (eigen categorie). Passe-partouts ook.

## Stap 3 – Omgevingsvariabelen

```
VITE_PAYLOGIC_TOKEN=<bearer jwt>
VITE_PAYLOGIC_EVENT=7ea4c49ff00f41d3acc549e0fdab376f
VITE_PAYLOGIC_API=https://shopping-api.sandbox.paylogic.com   # alleen tijdens testen
```

Lokaal in `.env.local`; op GitHub Pages als repository-secrets in de workflow (`env:` bij de build-stap). Zonder deze variabelen draait de shop op de voorbeelddata.

## Stap 4 – De schermen zijn aangesloten ✅

Gedaan (29 okt 2026). De shop schakelt automatisch:

| Scherm | Zonder token (voorbeeld) | Met token (live) |
|---|---|---|
| Dagkeuze / tickets | vaste data | `getStorefront()` → producten, uitverkocht, max per order; laad- en foutscherm met link naar de standaard shop |
| Parkeren | vaste data | parkeerproducten uit dezelfde storefront |
| Mandje | eigen som + demo-timer | `getBill()`; totaal van Paylogic is leidend; geen timer (Paylogic reserveert pas bij de order) |
| Gegevens | alle velden, 4 vaste betaalmethodes, XCover | betaalmethodes en verplichte velden uit de bill (iDEAL: alleen naam, e-mail, land); XCover verborgen (niet in de API); bij "Betaal": `createOrder()` → door naar de betaalpagina van Paylogic |
| Betalen | simulatiescherm | overgeslagen: koper zit op de Paylogic-betaalpagina |
| Bedankt | uit geheugen | order-uid onthouden vóór vertrek → `getOrder()`: `completed` → bedankpagina met e-ticketlink; `pending` → "status vernieuwen"; `canceled` → "Opnieuw betalen" via `shop:repayment` |

Foutmeldingen in gewone taal voor: geen verbinding, uitverkocht, captcha/drukte, ontbrekende gegevens, niet genoeg plekken naast elkaar.

Producten worden gekoppeld via `productMeta` (vaste tabel) óf automatisch uit de productnaam (`guessMeta`: herkent "Ireen Wüst bocht", "kids", "31 okt", "Parkeerticket P5", "Passe-Partout"). Producten die niet herkend worden staan in de console als waarschuwing.

**Nog te doen voor de echte verkoop**
- Captcha-widget inbouwen (Paylogic geeft `captcha.provider` + `public_key` in de storefront; het token moet mee in `createOrder`).
- Postcode-opzoeken: live vraagt de shop straat en plaats gewoon zelf (de bol.com-simulatie staat uit).
- Opt-ins: Paylogic kent één `opt_in`-vinkje; de WhatsApp- en HoS-vinkjes moeten naar jullie eigen CRM.
- Annuleringsbescherming (XCover) zit niet in de Shopping API; vraag Paylogic of dit via de API kan.
- Tracking (GA4/Meta) op `status: completed`.

### Lokaal testen zonder Paylogic

```
node server/mock-paylogic.mjs                                    # nep-Paylogic op :8788
VITE_PAYLOGIC_API=http://localhost:8788 VITE_PAYLOGIC_TOKEN=test VITE_PAYLOGIC_EVENT=test npm run dev
```

De nep-server heeft de WCKT-producten, een nep-betaalpagina (gelukt/annuleren) en simuleert de captcha-fout als de voornaam "Druk" is.

## Stap 5 – Testen in de sandbox

1. Storefront ophalen en controleren of alle producten een koppeling hebben (zie console-waarschuwingen).
2. Bill vergelijken met de prijzen in de huidige Paylogic-shop.
3. Order aanmaken met de test-betaalmethode van de sandbox, betalen, terugkomst en `status: completed` controleren.
4. Foutpaden: uitverkocht (`is_sold_out`), captcha (`CAPTCHA_RATE_LIMIT_REACHED` bij drukte: dan het captcha-token meesturen), afgebroken betaling (`shop:repayment`).

## Stap 6 – Optioneel: eigen server (BFF)

Niet nodig voor de eerste versie. Wel nuttig bij een verkoopstart:

- **Cache** de storefront 5–10 seconden zodat niet elke bezoeker Paylogic belast.
- **Rate limits** en captcha afhandelen op één plek.
- **Basic-credentials** gebruiken voor dingen die het frontend-token niet mag (bijv. orders van anderen inzien).

`server/bff.mjs` is daarvoor een schets.

## Let op

- **Deprecation**: Paylogic verwijdert velden ongeveer twee weken na een waarschuwing. Log waarschuwingen in de responses en plan onderhoud.
- **Piek bij verkoopstart**: de Paylogic-wachtrij staat alleen voor de Paylogic-shop. Houd de standaard shop als terugvaloptie (link staat in de footer) en zet eventueel een wachtrijdienst voor de eigen shop.
- **AVG**: alleen velden vragen die een betaalmethode of het event echt nodig heeft (`required_consumer_fields` is daarvoor de bron).
- **Tracking**: GA4/Meta-events zelf plaatsen (view_item, add_to_cart, begin_checkout, purchase na `status: completed`).
