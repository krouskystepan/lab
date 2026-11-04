export const starterEn = {
  'starter.appName': 'Starter',
  'starter.kit': "Electrician's kit",
  'starter.durability': 'Durability',
  'starter.new': 'New',
  'starter.newTitle': 'New loom (N)',
  'starter.againWin': 'Hotwire another',
  'starter.againLose': 'Try again',

  'starter.meter.volts': 'Volts',
  'starter.meter.ohms': 'Ohms',
  'starter.meter.dialAria': 'Multimeter dial',
  'starter.meter.dialTitle': 'Toggle V / OHM',

  'starter.note.battery': 'battery around 12 V',
  'starter.note.ignition': 'ignition around 3 ohm',
  'starter.note.starter': 'starter under 1 ohm',
  'starter.note.connect': 'join battery + ignition then hold on starter',
  'starter.note.live': 'a live wire damages the kit',

  'starter.tool.probe': 'probe',
  'starter.tool.probeTitle': 'Multimeter probe (1)',
  'starter.tool.jumper': 'jumper',
  'starter.tool.jumperTitle': 'Alligator clips (2)',

  'starter.hint.clipA': 'First clip on. Pick the second wire.',
  'starter.hint.dash': 'Dash lit up. Hold the other end on the starter.',
  'starter.hint.holding': 'Cranking… watch the tach.',
  'starter.hint.release': 'Needle at 2 — release now!',
  'starter.hint.overhold': 'Short! Held past 2 — clips dropped.',
  'starter.hint.ohmLive': 'Measured ohms on a live wire — kit took a hit.',
  'starter.hint.live': 'Live wire — kit took a hit.',
  'starter.hint.wrong': 'Wrong pair. Clips popped off.',
  'starter.hint.needStarter': 'Hold the starter wire to crank.',
  'starter.hint.won': 'Engine started.',
  'starter.hint.lost': 'Kit fried after too many mistakes.',

  'starter.toast.won': 'She lives. Engine running.',
  'starter.toast.lost': 'Kit burned out.',

  'starter.help.title': 'How to play',
  'starter.help.body':
    'GTA-style ignition hotwire. Four wires carry voltage, three carry resistance. Find battery / ignition / starter, jump them, then time the starter release on the tach.',
  'starter.help.controls':
    '1 = probe, 2 = jumper. V / O switch the dial. Click a wire to measure. Bridge two wires with jumpers. After the dash lights, hold starter until the needle hits 2, then release.',

  'starter.help.findTitle': 'Find the wires',
  'starter.help.findBody':
    'On volts (V): four wires show voltage — one is ~12 V (battery), the others can be anything. On ohms: three wires show resistance — 0.5–1 Ω is starter, 2.5–3 Ω is ignition, the last can be anything. Measuring ohms on a live wire damages the kit (~7 mistakes and it dies).',

  'starter.help.connectTitle': 'Connect them',
  'starter.help.connectBody':
    'Jumper battery to ignition (dash lights). Then hold the starter clamp and wait until the tach needle reaches the 2 mark — release there. Hold past 2 and you short the kit.',

  'starter.hotkeys.title': 'Controls',
  'starter.hotkeys.probe': 'probe',
  'starter.hotkeys.jumper': 'jumper',
  'starter.hotkeys.volts': 'volts',
  'starter.hotkeys.ohms': 'ohms',
  'starter.hotkeys.new': 'new',
  'starter.hotkeys.chip.probe': '1',
  'starter.hotkeys.chip.jumper': '2',
  'starter.hotkeys.chip.volts': 'V',
  'starter.hotkeys.chip.ohms': 'O',
  'starter.hotkeys.chip.new': 'N'
} as const
