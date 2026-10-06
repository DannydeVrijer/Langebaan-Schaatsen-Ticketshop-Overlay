/**
 * "Waarom zo?" – per scherm wat er anders is dan de huidige Paylogic-shop en welke
 * marketingtechniek erachter zit. Bronnen: map Team Events Marketing/context/Marketing Algemeen.
 * INF = Influence (Cialdini) · OI = Online invloed · DCS = DotCom Secrets · ES = Expert Secrets ·
 * R1 = Rapport 1 De perfect converterende mail · R2 = Rapport 2 De Boekenbijbel · TOR = Online marketing tornado
 */
export type Why = { t: string; s: string; bron: string };

export const why: Record<string, { title: string; items: Why[] }> = {
  day: {
    title: 'Tickets kiezen (startpagina)',
    items: [
      { t: 'Stap 1: eerst je dag kiezen', s: 'Zoals in de huidige shop begin je met de dag. Geen dag voorgeselecteerd: elke dag als duidelijke keuze met tijden en vanaf-prijs. Daarna pas de plekken.', bron: 'INF – kleine eerste stap · OI – keuzehulp' },
      { t: 'Direct tickets, geen programma voorop', s: 'Zoals een productpagina bij bol.com: je ziet meteen wat je kunt kopen en wat het kost. Programma, plattegrond en vragen staan achter een knop.', bron: 'bol.com – product en prijs eerst · DCS – één doel per pagina' },
      { t: 'Rust: één keer zeggen, niet overal', s: '"Inclusief servicekosten" en "kinderen t/m 5 gratis" staan één keer bovenaan in plaats van bij elke regel. Zekerheden (e-ticket, veilig betalen) staan rustig onder de lijst en in het mandje.', bron: 'bol.com – belofte herhalen · OI – afleiding verwijderen' },
      { t: '"Vanaf"-prijs per dag in de tabbladen', s: 'Prijs zichtbaar vóór je kiest, zoals bij varianten op bol.com.', bron: 'bol.com – prijs vooraf · DCS – value ladder' },
      { t: 'Toegevoegd-melding met "Handig erbij"', s: 'Na de eerste + verschijnt een onderblad: bevestiging, passe-partout-upgrade en max. 2 relevante extra\'s (kindticket, parkeren). Verder kiezen of naar je mandje.', bron: 'bol.com – pop-up winkelwagen & cross-sell (max. 3–4 suggesties)' },
      { t: 'Prijzen zonder €-teken', s: 'Zoals bol.com: 25,- en 12,⁵⁰ in plaats van € 25,00. Rustiger en sneller te scannen; in een Nederlandse shop is de valuta vanzelfsprekend. Schermlezers horen wel "25 euro".', bron: 'bol.com – prijsweergave' },
      { t: 'Doorgestreepte prijs alleen als hij klopt', s: 'Passe-partout: 75,- → 55,- is de echte som van 3 losse dagen. Geen verzonnen "van"-prijzen.', bron: 'Frankwatching – laat besparing zien · INF – contrast' },
      { t: 'Geen "Bestseller"-labels', s: 'bol.com gebruikt labels op basis van verkoopdata. Die hebben we niet, dus geen labels; de lijst blijft rustig.', bron: 'R1 – verboden: verzonnen bewijs' },
      { t: 'Alle vakken in één oogopslag', s: 'Nu: lange lijst met technische namen en een carrousel. Hier één rustige lijst: per vak plattegrondje, naam, één regel uitleg en vanaf-prijs. Tik om open te klappen; volwassene en kind staan samen.', bron: 'OI – keuzes verminderen, verwachte inspanning verlagen' },
      { t: 'Direct toevoegen met + en −', s: 'Nu: aantal kiezen én daarna "Toevoegen". Hier telt de + direct mee; teller in het mandje-icoon rechtsboven.', bron: 'OI – Jenga-techniek · bol.com – mandje rechtsboven met teller' },
      { t: 'Eerlijke schaarste', s: 'Alleen "Uitverkocht" en "Beperkt beschikbaar" als het zo is, plus een alternatief ("kies een andere dag").', bron: 'INF – echte schaarste · R1 §7.6' },
    ],
  },
  parking: {
    title: 'Parkeren',
    items: [
      { t: 'Alleen de dagen uit je mandje', s: 'Nu: een vinkje "Toon alleen aanbevolen producten". Hier standaard de juiste dag(en), de rest inklapbaar.', bron: 'OI – keuzehulp' },
      { t: 'Eén eerlijke reden', s: '"Rond Thialf is het druk; met een ticket weet je zeker dat je plek hebt." Eén angstregister, met uitweg.', bron: 'OI – loss aversion · R1 §6.4' },
      { t: '"Geen parkeren nodig" even zichtbaar', s: 'Overslaan is net zo makkelijk als toevoegen.', bron: 'R1 §11.2 – geen verstopte nee' },
    ],
  },
  cart: {
    title: 'Winkelmand',
    items: [
      { t: 'Timer als service, niet als dreiging', s: '"We houden je plekken nog 18:20 vast." Bij verlopen: je keuzes staan klaar om terug te zetten.', bron: 'R1 §6.4 – benoem kosten, dreig niet' },
      { t: 'Prijs zoals je hem kende', s: 'Nu: tickets € 25,00 in de shop, € 22,50 in het mandje + fees. Hier dezelfde prijs overal, servicekosten als "waarvan".', bron: 'OI – onzekerheid in checkout wegnemen' },
      { t: 'Aanpassen en verwijderen per regel', s: 'Omkeerbaarheid verlaagt de drempel om door te gaan.', bron: 'OI – omkeerbaarheid · bol.com – inline wijzigen' },
      { t: 'Besparing en "geen extra kosten"', s: 'Toon wat je bespaart met de passe-partout en dat er bij betalen niets bijkomt.', bron: 'Frankwatching – besparing tonen, geen onverwachte kosten' },
      { t: 'Vragen op het moment van twijfel', s: 'Korte FAQ onder het totaal, in plaats van een aparte pagina.', bron: 'bol.com – FAQ waar de vraag ontstaat' },
    ],
  },
  checkout: {
    title: 'Gegevens & betalen',
    items: [
      { t: 'Velden gegroepeerd, met reden', s: 'Nu: 13 velden onder elkaar, incl. landenlijst van 250 opties. Hier in blokken, NL/BE/DE bovenaan en per vraag waarom we het vragen.', bron: 'INF – reason why · OI – verwachte inspanning' },
      { t: 'Bescherming: kiezen, niet vooraf aangevinkt', s: 'Ja/Nee als gelijke opties. Nooit voor de koper aangevinkt.', bron: 'DCS – order bump · EU-consumentenrecht (algemeen)' },
      { t: 'Opt-ins los, uit, met waardebelofte', s: 'Per vinkje wat je krijgt. Nooit voorwaarde voor de aankoop.', bron: 'R1 §2.5 · AN – AVG' },
      { t: 'Knop noemt het bedrag', s: '"Betaal 60,-" – geen verrassing in de laatste stap.', bron: 'OI – benoem gedrag letterlijk' },
      { t: 'Postcode + huisnummer = adres', s: 'Zoals bij bol.com: in Nederland vul je alleen postcode en huisnummer in, de rest wordt opgezocht. Scheelt 2 velden.', bron: 'bol.com – formulier optimaliseren' },
      { t: '"Meest gebruikt in NL" bij iDEAL', s: 'bol.com laat zien welke betaalmethode de meeste mensen kiezen. iDEAL is de meest gebruikte online betaalmethode in Nederland.', bron: 'bol.com – social proof bij betaalmethode' },
      { t: 'Geen afleiding', s: 'Geen menu of links weg uit de checkout; alleen terug naar je mandje.', bron: 'bol.com – navigatie verbergen in checkout' },
    ],
  },
  thanks: {
    title: 'Bedankt',
    items: [
      { t: 'Confettiregen', s: 'Beloon de aankoop zichtbaar: "Je bent erbij!"', bron: 'OI – confettiregen' },
      { t: 'Eén vervolgaanbod, met even zichtbare "nee"', s: 'Parkeren of passe-partout ná de aankoop, nooit ervoor.', bron: 'DCS – upsell na aankoop' },
      { t: 'Delen met vrienden', s: 'Van koper naar ambassadeur: "Ga je met vrienden? Stuur ze de link."', bron: 'TOR – community · INF – unity' },
    ],
  },
};
