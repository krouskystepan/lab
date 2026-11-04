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
  'starter.note.connect': 'join battery + ignition, then hold starter',
  'starter.note.live': 'a live wire damages the kit',

  'starter.tool.probe': 'probe',
  'starter.tool.probeTitle': 'Multimeter probe (1)',
  'starter.tool.jumper': 'jumper',
  'starter.tool.jumperTitle': 'Alligator clips (2)',

  'starter.hint.clipA': 'First clip on. Pick the second wire.',
  'starter.hint.dash': 'Dash lit up. Hold the other end on the starter.',
  'starter.hint.holding': 'Cranking… keep holding.',
  'starter.hint.live': 'Live wire — kit took a hit.',
  'starter.hint.wrong': 'Wrong pair. Clips popped off.',
  'starter.hint.needStarter': 'Hold the starter wire to crank.',
  'starter.hint.won': 'Engine started.',
  'starter.hint.lost': 'Kit fried. Grab a new one.',

  'starter.toast.won': 'She lives. Engine running.',
  'starter.toast.lost': 'Kit burned out.',

  'starter.help.title': 'How to play',
  'starter.help.body':
    'GTA-style ignition hotwire. Probe the loom with a multimeter, remember the wire colors, then jump the right ones without frying the kit.',
  'starter.help.controls':
    '1 = probe, 2 = jumper clips. V / O switch the dial. Hover wires to measure. Click two wires to bridge. After the dash lights, press and hold the starter.',

  'starter.help.findTitle': 'Find the wires',
  'starter.help.findBody':
    'First switch to volts (V) and find the cable with ~12 V — that is the battery (other wires may show a little voltage too). Then switch to ohms and find ~3 Ω (ignition) and under 1 Ω (starter). Remember the colors.',

  'starter.help.connectTitle': 'Connect them',
  'starter.help.connectBody':
    'Switch to the jumper (2). Bridge battery to ignition — the dash lights up. Then press and hold the starter until it cranks. Touching a live wire with a bad jump damages durability.',

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
