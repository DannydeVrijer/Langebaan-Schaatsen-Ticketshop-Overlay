import type { DayKey, ZoneKey } from '../api/types';

/**
 * Eigen content per tribunevak. Dit staat NIET in Paylogic: hier zit de vrijheid
 * van een eigen frontend (teksten, USP's, volgorde, beeld).
 */
export const zones: Record<Exclude<ZoneKey, 'parking'>, { title: string; short: string; kind: 'Staan' | 'Zitten' | 'Arrangement' | 'Toegankelijk'; pitch: string; usps: string[] }> = {
  noord: {
    title: 'Ireen Wüst bocht',
    short: 'Noord',
    kind: 'Staan',
    pitch: 'Staan in de bocht waar de races beslist worden. Hier is het feest het luidst.',
    usps: ['Dicht op het ijs', 'Oranjefeest-sfeer', 'Kids half geld'],
  },
  zuid: {
    title: 'Sven Kramer bocht',
    short: 'Zuid',
    kind: 'Staan',
    pitch: 'De bocht waar de start- en finishduels van dichtbij voorbij razen.',
    usps: ['Dicht op het ijs', 'Zicht op de wissel', 'Kids half geld'],
  },
  west: {
    title: 'Tribune West',
    short: 'West',
    kind: 'Zitten',
    pitch: 'Een vaste zitplaats langs het rechte eind, met overzicht over de hele baan.',
    usps: ['Eigen zitplaats', 'Overzicht hele baan', 'Scorebord in zicht'],
  },
  oost: {
    title: 'Tribune Oost',
    short: 'Oost',
    kind: 'Zitten',
    pitch: 'De hoofdtribune: zitplaats aan de finishzijde, dichtbij de huldigingen.',
    usps: ['Finishzijde', 'Huldigingen van dichtbij', 'Tv-kant'],
  },
  vip: {
    title: 'VIP-arrangement',
    short: '2e etage',
    kind: 'Arrangement',
    pitch: 'Volledig verzorgd op de 2e etage aan de oostzijde, met een zitplaats op de tribune.',
    usps: ['Catering inbegrepen [bevestigen]', 'Eigen ingang [bevestigen]', 'Zitplaats Oost'],
  },
  mv: {
    title: 'Mindervaliden tribune',
    short: 'Toegankelijk',
    kind: 'Toegankelijk',
    pitch: 'Een toegankelijke plek met goed zicht. Kies los of samen met een begeleider.',
    usps: ['Rolstoelplaats', 'Begeleider mogelijk', 'Locatie: [bevestigen]'],
  },
};

export const days: { key: DayKey; label: string; sub: string; program: string }[] = [
  { key: 'vr', label: 'Vr 30 okt', sub: 'Dag 1', program: '[programma aanleveren] Bijv. 500 m en 3000/5000 m' },
  { key: 'za', label: 'Za 31 okt', sub: 'Dag 2', program: '[programma aanleveren] Bijv. 1000 m en 1500 m' },
  { key: 'zo', label: 'Zo 1 nov', sub: 'Dag 3', program: '[programma aanleveren] Bijv. massastart en 5000/10.000 m' },
  { key: 'pp', label: 'Alle dagen', sub: 'Passe-partout', program: 'Alle drie de dagen voor één prijs.' },
];

export const audienceLabel = { volwassene: 'Volwassene', kids: 'Kind [leeftijd bevestigen]', los: 'Mindervalide', begeleider: 'Mindervalide + begeleider', auto: 'Auto' } as const;
