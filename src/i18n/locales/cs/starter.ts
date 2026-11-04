import type { starterEn } from '../en/starter'

/** Czech */
export const starterCs: Record<keyof typeof starterEn, string> = {
  'starter.appName': 'Startér',
  'starter.kit': 'Sada elektrikáře',
  'starter.durability': 'Trvanlivost',
  'starter.new': 'Nový',
  'starter.newTitle': 'Nový svazek (N)',
  'starter.againWin': 'Další start',
  'starter.againLose': 'Zkus znovu',

  'starter.meter.volts': 'Volty',
  'starter.meter.ohms': 'Ohmy',
  'starter.meter.dialAria': 'Přepínač multimetru',
  'starter.meter.dialTitle': 'Přepni V / OHM',

  'starter.note.battery': 'baterie kolem 12 V',
  'starter.note.ignition': 'zapalování kolem 3 ohm',
  'starter.note.starter': 'startér pod 1 ohm',
  'starter.note.connect': 'spoj baterii a zapalování pak podrž na startéru',
  'starter.note.live': 'drát pod napětím poškodí sadu',

  'starter.tool.probe': 'sonda',
  'starter.tool.probeTitle': 'Sonda multimetru (1)',
  'starter.tool.jumper': 'svorky',
  'starter.tool.jumperTitle': 'Krokosvorky (2)',

  'starter.hint.clipA': 'První svorka drží. Vyber druhý kabel.',
  'starter.hint.dash':
    'Palubka se rozsvítila. Klikni na startér a sleduj otáčkoměr.',
  'starter.hint.holding': 'Startuje… sleduj otáčkoměr.',
  'starter.hint.release': 'Ručka na 2 — klikni znovu!',
  'starter.hint.overhold': 'Zkrat! Přes 2 — svorky odpadly.',
  'starter.hint.ohmLive': 'Měřil jsi ohmy na drátu pod napětím — sada dostala zásah.',
  'starter.hint.live': 'Drát pod napětím — sada dostala zásah.',
  'starter.hint.wrong': 'Špatná dvojice. Svorky odpadly.',
  'starter.hint.needStarter': 'Drž kabel startéru.',
  'starter.hint.won': 'Motor naskočil.',
  'starter.hint.lost': 'Sada odešla po moc chybách.',

  'starter.toast.won': 'Naskočilo. Motor běží.',
  'starter.toast.lost': 'Sada shořela.',

  'starter.help.title': 'Jak hrát',
  'starter.help.body':
    'Startér ve stylu GTA RP. Čtyři kabely mají napětí, tři odpor. Najdi baterii / zapalování / startér, propoj je a pusť startér na dvojce na budíku.',
  'starter.help.controls':
    '1 = sonda, 2 = svorky. V / O přepíná rozsah. Klikni na kabel pro změření. Spoj dva kabely svorkami. Po rozsvícení palubky klikni na startér; až ručka dojde na 2, klikni znovu.',

  'starter.help.findTitle': 'Najdi kabely',
  'starter.help.findBody':
    'Na voltech (V): čtyři kabely mají napětí — jeden ~12 V (baterie), ostatní cokoliv. Na ohmech: tři kabely — 0,5–1 Ω startér, 2,5–3 Ω zapalování, poslední cokoliv. Měření ohmů na drátu pod napětím ubírá kondici (~7 chyb a sada odejde).',

  'starter.help.connectTitle': 'Zapoj je',
  'starter.help.connectBody':
    'Spoj baterii se zapalováním (rozsvítí se palubka). Pak klikni na startér a čekej, až ručka na otáčkoměru vyleze na 2 — tam klikni znovu. Přes 2 dostaneš zkrat.',

  'starter.hotkeys.title': 'Ovládání',
  'starter.hotkeys.probe': 'sonda',
  'starter.hotkeys.jumper': 'svorky',
  'starter.hotkeys.volts': 'volty',
  'starter.hotkeys.ohms': 'ohmy',
  'starter.hotkeys.new': 'nový',
  'starter.hotkeys.chip.probe': '1',
  'starter.hotkeys.chip.jumper': '2',
  'starter.hotkeys.chip.volts': 'V',
  'starter.hotkeys.chip.ohms': 'O',
  'starter.hotkeys.chip.new': 'N'
}
