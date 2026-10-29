# Begrippen, in gewone taal

Voor wie de shop beheert zonder technische achtergrond. Steeds: wat het is, en wat het voor onze shop betekent.

**API (Application Programming Interface)**
Een "loket" waar een programma vragen aan een ander programma stelt, zonder scherm ertussen. Onze shop vraagt aan het loket van Paylogic: "welke tickets zijn er en wat kosten ze?" en "maak deze bestelling aan". De antwoorden komen als data terug, en onze shop maakt daar de schermen van. De Paylogic-shop die je nu kent gebruikt onder water hetzelfde loket.

**Shopping Service API**
De naam van dat loket bij Paylogic. Er zijn ook andere loketten (bijvoorbeeld voor toegangscontrole), maar deze is voor verkopen.

**Endpoint / aanroep**
Eén specifieke vraag aan het loket, met een eigen adres. Bijvoorbeeld `/storefront` (geef me het aanbod) of `/orders` (maak een bestelling). Onze shop gebruikt er vier.

**Token (Bearer-token)**
Een lange, onleesbare tekenreeks die als sleutel werkt. Paylogic maakt hem voor jullie aan en elke aanroep stuurt hem mee. Zo weet Paylogic: dit is de shop van House of Sports, die mag het aanbod van dit event zien en bestellingen aanmaken. "Bearer" betekent letterlijk "drager": wie de sleutel heeft, mag naar binnen. Daarom deel je hem niet rond. Dit specifieke token heeft beperkte rechten (lezen en bestellen, niet wijzigen), waardoor hij in de browser van bezoekers mag staan.

**Basic-credentials (app-id + secret)**
Een zwaardere sleutel met meer rechten, bedoeld voor een server. Die mag nooit in de browser, want iedereen die de pagina opent zou hem kunnen uitlezen. Wij hebben hem voor de shop niet nodig.

**Sandbox**
Een oefenomgeving van Paylogic die precies werkt als de echte, maar met nepgeld en testevents. Daar test je de koppeling zonder dat er echte betalingen of tickets ontstaan. Pas als alles daar werkt, zet je de sleutel van de echte omgeving ("productie") erin.

**Productie**
De echte omgeving, met echte betalingen en echte tickets.

**Storefront**
Het "etalage"-antwoord van Paylogic: alle producten van een event met prijs, servicekosten, uitverkocht ja/nee en hoeveel je er maximaal mag bestellen. Onze shop haalt dit op zodra iemand de pagina opent.

**Bill**
Een proefrekening. Je stuurt je mandje en je land, en Paylogic rekent het exacte totaal uit en zegt welke betaalmethodes er zijn en welke gegevens die vereisen (iDEAL weinig, PayPal meer). Onze shop gebruikt dit in het mandje en bij afrekenen, zodat het bedrag altijd klopt met wat Paylogic in rekening brengt.

**Order**
De bestelling zelf. Zodra onze shop die aanmaakt, reserveert Paylogic de tickets en geeft een betaallink terug. Daar sturen we de koper naartoe.

**Redirect (terugkeer-URL)**
Het adres waar Paylogic de koper na het betalen naartoe terugstuurt. Bij ons is dat de bedankpagina. Die controleert dan bij Paylogic of de betaling echt gelukt is.

**Status (pending / completed / canceled)**
Wat Paylogic over een bestelling zegt: wacht op betaling, betaald, of geannuleerd. Alleen bij "completed" tonen we de bedankpagina met e-tickets.

**Repayment**
Opnieuw proberen te betalen als het de eerste keer mislukte, zonder een nieuwe bestelling te hoeven maken.

**Captcha**
De "ik ben geen robot"-controle. Paylogic zet die aan als het heel druk is, om bots tegen te houden. Onze shop toont dan de melding "Het is druk, probeer het zo opnieuw". Voor de echte verkoopstart moet de captcha-widget nog ingebouwd worden (staat in KOPPELING.md).

**Omgevingsvariabele (`VITE_PAYLOGIC_TOKEN` enz.)**
Een instelling die je buiten de code om meegeeft, zoals een sleutel in een apart kluisje. Zo staat het token nooit in de code op GitHub. Lokaal zet je ze in het bestand `.env.local`; op GitHub als "secret".

**Mock / voorbeeldmodus**
Zolang er geen token is, draait de shop op ingebouwde voorbeelddata. Dat is wat je nu online ziet. Met token schakelt hij vanzelf over naar live. Er is ook een nep-Paylogic (`server/mock-paylogic.mjs`) waarmee een developer de hele live-route lokaal kan doorlopen.

**GitHub Pages**
De gratis hosting van GitHub waar de shop online staat. Bij elke wijziging bouwt GitHub de shop opnieuw.
