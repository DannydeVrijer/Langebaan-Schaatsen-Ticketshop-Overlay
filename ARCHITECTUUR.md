# Architectuur: eigen ticketshop op Paylogic

## Wie doet wat

| Jullie (zelf bouwen en hosten) | Paylogic (blijft zoals nu) |
|---|---|
| Alle schermen: toernooien, dag- en vakkeuze, mandje, gegevens, bevestiging | Producten, prijzen, voorraad (beheer in de backoffice) |
| Eigen content per vak/dag (`src/data/zones.ts`) | Orders aanmaken en reserveren |
| Logica in de flow: passe-partout-tip, upsells, volgorde | Betaalpagina en PSP |
| BFF-server die de API-sleutel bewaart en cachet | E-tickets, personalisatie, refunds, toegangscontrole |

```
browser (deze shop)  ──►  BFF (jullie server)  ──►  shopping-api.paylogic.com
                                                         │
koper  ◄── redirect_url ◄── betaalpagina Paylogic ◄──────┘ (payment-link uit de order)
```

## API-aanroepen per stap

| Stap | Aanroep | Opmerking |
|---|---|---|
| Toernooien | `GET /events` | Lang cachebaar (min.) |
| Shop openen | `GET /storefront?event=…` | Producten, prijzen, beschikbaarheid. Kort cachen (sec.) |
| Afrekenen | `GET /bill?products=…` | Paylogic rekent het definitieve bedrag |
| Betalen | `POST /orders` | Geeft `payment`-link; daarheen sturen |
| Terugkomst | `redirect_url` | Status ophalen met `GET /orders/{uid}` |
| Na aankoop | `/personalization`, `/personalization-requests` | Tickets op naam (eventueel eigen schermen) |

## Wat nog gebouwd moet worden voor productie

1. **API-toegang** aanvragen bij Eventim/Paylogic (credentials, rol, testomgeving/sandbox).
2. **BFF afmaken** (`server/bff.mjs` is een niet-geteste schets): exacte requestvelden en authenticatie volgens de docs, foutafhandeling, logging, rate-limiting.
3. **Mapping** van de HAL-responses van Paylogic (`_embedded`, `_links`) naar de types in `src/api/types.ts`. In het prototype is die vorm vereenvoudigd.
4. **Productindeling** (product-uid → dag/vak/doelgroep). Paylogic kent geen "vak"; dat legt de shop zelf vast. Voorstel: een configbestand of CMS dat marketing per toernooi vult. Nu gebeurt dit in `mockData.ts`.
5. **Terugkomst na betalen**: orderstatus ophalen in plaats van aannemen dat het gelukt is.
6. **Tracking**: GA4/Meta-events (view_item, add_to_cart, begin_checkout, purchase) zelf inbouwen – geen iframe-beperkingen meer.
7. **Wachtrij** bij verkoopstarts (WCKT/EK): de Paylogic-wachtrij beschermt alleen de Paylogic-shop. Opties: wachtrijdienst vóór de eigen shop, statische hosting + CDN, BFF-cache.
8. **Fallback**: bij storing automatisch doorverwijzen naar de standaard Paylogic-shop (de link staat al in elke shop).

## Risico's

- **Piekbelasting** ligt deels bij jullie. Statische frontend (CDN) + cache in de BFF vangt het meeste op; orders gaan altijd live naar Paylogic.
- **Onderhoud**: wijzigingen in de Paylogic-API (deprecation policy in de docs) moeten jullie bijhouden.
- **Contract/kosten**: check of API-gebruik in jullie overeenkomst zit.
- **Privacy**: de BFF verwerkt persoonsgegevens (naam, e-mail, IP) → verwerkersafspraken en logging-beleid regelen.

## Bronnen

- Paylogic Shopping Service API: https://shopping-api-docs.paylogic.com/
- Huidige shop: https://tickets.schaatsen.nl/7ea4c49ff00f41d3acc549e0fdab376f/tickets
