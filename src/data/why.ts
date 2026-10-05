/**
 * "Waarom zo?" – per scherm wat er anders is dan de huidige Paylogic-shop en welke
 * marketingtechniek erachter zit. Bronnen: map Team Events Marketing/context/Marketing Algemeen.
 * INF = Influence (Cialdini) · OI = Online invloed · DCS = DotCom Secrets · ES = Expert Secrets ·
 * R1 = Rapport 1 De perfect converterende mail · R2 = Rapport 2 De Boekenbijbel · TOR = Online marketing tornado
 */
export type Why = { t: string; s: string; bron: string };

export const why: Record<string, { title: string; items: Why[] }> = {
  home: {
    title: 'Start',
    items: [
      { t: 'Programma als voorpret, niet als plaatje', s: 'Nu staat het programma in een afbeelding met kleine letters. Hier is het echte tekst per dag, met één zin over wat je gaat zien. Leesbaar, zoekbaar en toegankelijk.', bron: 'OI – anticiperend enthousiasme' },
      { t: 'Eerst de kleinste keuze: welke dag?', s: 'Geen prijzen en aantallen vooraf. Een dag kiezen is een lichte eerste stap.', bron: 'INF – commitment & consistentie · OI – baby steps' },
      { t: '"Vanaf"-prijs per dag', s: 'Nu zie je pas prijzen na het klikken op een dag. Hier staat de instapprijs meteen op de dagkaart.', bron: 'DCS – value ladder (laagdrempelige instap zichtbaar)' },
      { t: 'Passe-partout met echte rekensom', s: '"Alle 3 dagen voor €55, los €75." Alleen een vergelijking die klopt.', bron: 'DCS/ES – offer stack · INF – contrast' },
      { t: 'Echte quote van een schaatser', s: 'Van magievanschaatsen.nl. Geen verzonnen reviews of aantallen.', bron: 'INF – social proof · R1 – verboden: verzonnen bewijs' },
    ],
  },
  day: {
    title: 'Tickets kiezen',
    items: [
      { t: 'Gegroepeerd: Staan · Zitten · Beleven · Toegankelijk', s: 'Nu: lange lijst met technische namen ("Ireen Wüst bocht - Noord - kids - 31 okt") en een carrousel voor zitplaatsen. Hier per vak één kaart, met volwassene en kind samen.', bron: 'OI – keuzes verminderen, keuzehulp' },
      { t: 'Plattegrond die meedenkt', s: 'Tik op een vak in de plattegrond en je springt naar dat ticket. Elke kaart laat zien waar je staat.', bron: 'OI – verwachte inspanning verlagen' },
      { t: 'Direct toevoegen met + en −', s: 'Nu: aantal kiezen én daarna nog op "Toevoegen" drukken. Hier telt de + direct mee.', bron: 'OI – Jenga-techniek (stappen weghalen)' },
      { t: 'Info in een onderblad i.p.v. mini-popup', s: 'Kids-leeftijden en VIP-inhoud zijn leesbaar en groot, met de offer stack voor VIP.', bron: 'DCS – offer stack · INF – reason why' },
      { t: 'Eerlijke schaarste', s: 'Alleen "Uitverkocht" en "Beperkt beschikbaar" als het zo is. Geen nep-aftellers of "nog 3 plekken".', bron: 'INF – echte schaarste · R1 §7.6 · R2 spanning 3' },
      { t: 'Passe-partout-tip na 2 dagen', s: 'Kies je hetzelfde vak op meerdere dagen, dan rekent de shop het voor je uit. Eén regel, geen pop-up.', bron: 'DCS – value ladder' },
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
      { t: 'Prijs zoals je hem kende', s: 'Nu: tickets €25 in de shop, €22,50 in het mandje + fees. Hier dezelfde prijs overal, servicekosten als "waarvan".', bron: 'OI – onzekerheid in checkout wegnemen' },
      { t: 'Aanpassen en verwijderen per regel', s: 'Omkeerbaarheid verlaagt de drempel om door te gaan.', bron: 'OI – omkeerbaarheid' },
    ],
  },
  checkout: {
    title: 'Gegevens & betalen',
    items: [
      { t: 'Velden gegroepeerd, met reden', s: 'Nu: 13 velden onder elkaar, incl. landenlijst van 250 opties. Hier in blokken, NL/BE/DE bovenaan en per vraag waarom we het vragen.', bron: 'INF – reason why · OI – verwachte inspanning' },
      { t: 'Bescherming: kiezen, niet vooraf aangevinkt', s: 'Ja/Nee als gelijke opties. Nooit voor de koper aangevinkt.', bron: 'DCS – order bump · EU-consumentenrecht (algemeen)' },
      { t: 'Opt-ins los, uit, met waardebelofte', s: 'Per vinkje wat je krijgt. Nooit voorwaarde voor de aankoop.', bron: 'R1 §2.5 · AN – AVG' },
      { t: 'Knop noemt het bedrag', s: '"Betaal €60,00" – geen verrassing in de laatste stap.', bron: 'OI – benoem gedrag letterlijk' },
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
