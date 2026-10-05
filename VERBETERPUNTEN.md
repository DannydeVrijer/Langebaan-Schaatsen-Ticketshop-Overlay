# Huidige Paylogic-shop vs. v2 (fictief voorbeeld)

Bekeken op 5 okt 2026: tickets.schaatsen.nl, World Cup Kwalificatietoernooi. Flow: dagkeuze → tickets → parkeren → winkelwagen (20 min) → afrekenen → betalen.

## Wat beter kan in de huidige shop

| # | Nu | Probleem | In v2 |
|---|---|---|---|
| 1 | Programma staat in een afbeelding | Kleine letters, niet leesbaar op mobiel, niet zoekbaar of voorleesbaar | Echte tekst per dag + onderblad met alle afstanden |
| 2 | Dagkaarten zonder prijs | Je ziet pas na klikken wat het kost | "vanaf"-prijs en tijden op elke dagkaart |
| 3 | Productnamen als "Ireen Wüst bocht - Noord - kids - 31 okt" | Technisch, lang, dubbele info (dag staat er al) | Eén kaart per vak, regels "Volwassene (13+)" / "Kind (6 t/m 12 jaar)" |
| 4 | Zitplaatsen in een carrousel (Vorige/Volgende) | VIP valt buiten beeld, slecht te vergelijken | Alles onder elkaar, gegroepeerd Staan · Zitten · Beleven · Toegankelijk |
| 5 | Aantal kiezen + daarna "Toevoegen" | Extra stap; mensen denken dat het al in het mandje zit | + telt direct mee, teller op dagtabblad en mandje |
| 6 | Kids-leeftijd en VIP-inhoud achter een klein i-icoon | Belangrijke info verstopt | Duidelijke link + leesbaar onderblad, VIP als opsomming met voordelen |
| 7 | Plattegrond alleen als plaatje op de startpagina | Niet gekoppeld aan de producten | Tik op een vak → spring naar dat ticket; elke kaart toont waar je zit |
| 8 | Parkeren: lange lijst met uitverkochte terreinen | Ruis | Alleen beschikbare terreinen, vol samengevat in één regel; alleen jouw dagen |
| 9 | Mandje: €22,50 + fees, terwijl de shop €25,00 toonde | Prijs lijkt te veranderen | Overal dezelfde prijs, servicekosten als "waarvan" |
| 10 | Timer zonder uitleg | Voelt als druk | "We houden je plekken nog 18:20 voor je vast" + herstel na verlopen |
| 11 | Afrekenen: 13 velden onder elkaar, landenlijst van ~250 | Lang, geen uitleg waarom | Genummerde blokken, reden per vraag, NL/BE/DE/NO bovenaan, segmentknoppen |
| 12 | Opt-ins en voorwaarden in één blok | Onduidelijk wat je krijgt | Los, uit, met waardebelofte; "Afmelden kan altijd" |
| 13 | Knop "Betaal € 25,00" onderaan lange pagina | Ver weg op mobiel | Vaste actiebalk met bedrag, altijd in duimbereik |

## Advies voor de Paylogic-configuratie (ook zonder eigen shop)

- **Geslacht, geboortedatum en adres**: zijn die echt nodig? Elk verplicht veld kost conversie. Maak ze optioneel of schrap ze als er geen concreet doel is (en AVG: dataminimalisatie).
- **Productnamen** in de backoffice inkorten: dag weglaten in de naam (staat al in de pagina), "kids" → "Kind 6–12 jaar".
- **Programma als tekst** in de eventbeschrijving zetten i.p.v. alleen als afbeelding.
- **Parkeren**: "Toon alleen aanbevolen producten" standaard aan.

## Marketingtechnieken in v2 (bronnen: map Marketing Algemeen)

In de shop zit op elk scherm een knop **Waarom?** met de keuzes en bron. Samengevat:

- Eén doel en één knop per scherm (DotCom Secrets) · stap X van 5 (Online invloed)
- Kleine eerste stap: eerst de dag (Influence – commitment)
- Keuzes beperken en groeperen (Online invloed)
- Value ladder: passe-partout-tip na 2 dagen, met echte rekensom (DotCom Secrets)
- Offer stack voor VIP (DotCom/Expert Secrets)
- Echte quotes van fans en schaatsers (Influence – social proof); geen verzonnen aantallen
- Eerlijke schaarste: alleen "uitverkocht"/"beperkt" als het klopt (Influence, Rapport 1 §7.6)
- Timer als service, nooit resetten (Rapport 1 §6.4)
- Reason why bij elk veld (Influence)
- Bescherming en opt-ins nooit vooraf aangevinkt (EU-consumentenrecht, AVG)
- Confettiregen + één vervolgaanbod met even zichtbare "nee" + delen met vrienden (Online invloed, DotCom Secrets, Tornado)

## Bewust niet gedaan

Nep-aftellers, "X mensen kijken nu", verzonnen reviews, vooraf aangevinkte extra's, verstopte "nee"-knoppen, hype-toon.

## v2.1 – lessen van bol.com

bol.com blokkeert automatische bezoekers; dit is gebaseerd op analyses van hun aanpak ([Frankwatching 2015](https://www.frankwatching.com/archive/2015/09/07/zo-doet-bol-com-aan-conversieoptimalisatie-op-de-betaalpagina/), [Frankwatching 2018](https://www.frankwatching.com/archive/2018/05/07/meer-conversie-op-jouw-winkelwagenpagina-10-tips/), [Rylee](https://rylee.nl/nl/blog/de-waarde-van-upsell-en-crosssell-technieken-bij-het-verkopen-op-bol.com)).

| bol.com doet | In de ticketshop |
|---|---|
| Product en prijs eerst | Startpagina = tickets; programma/plattegrond/vragen achter een knop |
| Belofte herhalen (bezorging, retour) | Zekerheden-balk: e-ticket direct in je mail · veilig betalen · kinderen t/m 5 gratis; herhaald in het mandje |
| Pop-up na "In winkelwagen" + "vaak samen gekocht" | Toegevoegd-melding met passe-partout-upgrade en max. 2 extra's (kindticket, parkeren). Bewust "Handig erbij": zonder verkoopdata geen "vaak samen gekocht" |
| Mandje rechtsboven met teller | Mandje-icoon met aantal en reserveringstijd |
| Besparing tonen | Doorgestreepte prijs bij passe-partout (echte som van 3 dagen) en "je bespaart" in het mandje |
| Geen onverwachte kosten | "Geen extra kosten bij het betalen" onder het totaal |
| FAQ waar de twijfel ontstaat | Vragen onder het mandje en als knop op de startpagina |
| Postcode + huisnummer | Adres wordt opgezocht (gesimuleerd; in het echt een postcode-API) |
| Betaalmethode met social proof | "Meest gebruikt in NL" bij iDEAL |
| Navigatie weg in checkout | Alleen terug naar je mandje |

Niet overgenomen: sterren/reviews en "bestseller"-labels (geen echte data), kortingscodes en exit-intent-kortingen.
