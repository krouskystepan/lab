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
  'starter.note.connect': 'spoj baterii a zapalování, podrž startér, pak pusť',
  'starter.note.live': 'drát pod napětím poškodí sadu',

  'starter.tool.probe': 'sonda',
  'starter.tool.probeTitle': 'Sonda multimetru (1)',
  'starter.tool.jumper': 'svorky',
  'starter.tool.jumperTitle': 'Krokosvorky (2)',

  'starter.hint.clipA': 'První svorka drží. Vyber druhý kabel.',
  'starter.hint.dash':
    'Palubka se rozsvítila. Teď se druhým koncem dotkni startéru a drž.',
  'starter.hint.holding': 'Startuje… drž.',
  'starter.hint.release': 'Naskočilo — teď pusť!',
  'starter.hint.overhold': 'Držel jsi moc dlouho. Svorky odpadly a sada dostala zásah.',
  'starter.hint.live': 'Drát pod napětím — sada dostala zásah.',
  'starter.hint.wrong': 'Špatná dvojice. Svorky odpadly.',
  'starter.hint.needStarter': 'Drž kabel startéru.',
  'starter.hint.won': 'Motor naskočil.',
  'starter.hint.lost': 'Sada odešla. Vezmi novou.',

  'starter.toast.won': 'Naskočilo. Motor běží.',
  'starter.toast.lost': 'Sada shořela.',

  'starter.help.title': 'Jak hrát',
  'starter.help.body':
    'Startér ve stylu GTA RP. Proměř svazek multimetrem, zapamatuj si barvy kabelů a propoj správné — bez spálení sady.',
  'starter.help.controls':
    '1 = sonda, 2 = krokosvorky. V / O přepíná rozsah. Najetí na kabel měří. Klikni dva kabely pro most. Po rozsvícení palubky drž startér.',

  'starter.help.findTitle': 'Najdi kabely',
  'starter.help.findBody':
    'Nejdřív si na voltech (V) najdi kabely pod napětím a tu s ~12 V — to je baterie. Pak přepni na ohmy a najdi ~3 Ω (zapalování) a pod 1 Ω (startér). Zapamatuj si barvičky.',

  'starter.help.connectTitle': 'Zapoj je',
  'starter.help.connectBody':
    'Přepni na svorky (2). Spoj baterii se zapalováním — rozsvítí se palubka. Drž startér, dokud nenasadí, pak pusť. Držíš-li moc dlouho, svorky odpadnou a sada dostane zásah. Živý drát taky ubírá trvanlivost.',

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
