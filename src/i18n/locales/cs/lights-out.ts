import type { lightsOutEn } from '../en/lights-out'

export const lightsOutCs: Record<keyof typeof lightsOutEn, string> = {
  'lightsOut.appName': 'Lights Out',
  'lightsOut.gridAria': 'Mřížka světel',
  'lightsOut.cellOn': 'Řádek {r}, sloupec {c}, svítí',
  'lightsOut.cellOff': 'Řádek {r}, sloupec {c}, zhasnuto',
  'lightsOut.diff.title': 'Obtížnost',
  'lightsOut.diff.easy': 'Lehká',
  'lightsOut.diff.medium': 'Střední',
  'lightsOut.diff.hard': 'Těžká',
  'lightsOut.diff.expert': 'Expert',
  'lightsOut.diff.insane': 'Šílená',
  'lightsOut.diff.applyTitle': 'Nová úloha na této obtížnosti',
  'lightsOut.diff.helpTitle': 'Obtížnost',
  'lightsOut.diff.helpBody':
    'Lehká je 3×3 (2–4 stisky). Střední 4×4 (4–8). Těžká je klasická 5×5 (8–14). Expert nacpe 6×6 (12–20). Šílená je 7×7 (18–28).',
  'lightsOut.time': 'Čas',
  'lightsOut.timer': 'Uplynulý čas',
  'lightsOut.moves': 'Tahy',
  'lightsOut.movesTitle': 'Stisky / nejkratší řešení',
  'lightsOut.new': 'Nová',
  'lightsOut.newTitle': 'Nová úloha (N)',
  'lightsOut.reset': 'Reset',
  'lightsOut.resetTitle': 'Vrátit tuto úlohu (R)',
  'lightsOut.toast.won': 'Zhasnuto za {n}.',
  'lightsOut.hint.none': 'Odtud řešení není - Reset a zkus znovu.',
  'lightsOut.tools.title': 'Nástroje',
  'lightsOut.tools.undo': 'Zpět',
  'lightsOut.tools.redo': 'Znovu',
  'lightsOut.tools.undoTitle': 'Zpět poslední stisk (⌘Z)',
  'lightsOut.tools.redoTitle': 'Znovu (⌘⇧Z)',
  'lightsOut.tools.hint': 'Tip',
  'lightsOut.tools.hintTitle':
    'Stisknout jedno světlo po nejkratším řešení (H)',
  'lightsOut.tools.hintTipTitle': 'Nápověda',
  'lightsOut.tools.hintTipBody':
    'Stiskne jedno pole, které patří do nejkratšího zbývajícího řešení. Pořád to můžeš vrátit.',

  'lightsOut.help.title': 'Jak hrát',
  'lightsOut.help.body':
    'Klikni na světlo a přepne se ono i čtyři sousedé. Pořadí nehraje roli - stejné pole dvakrát se vynuluje. Zhasni všechna.',
  'lightsOut.help.controls':
    'Klikni, nebo vyber šipkami a stiskni mezerník. Tip (H) udělá jeden dobrý stisk. Reset (R) vrátí tuto úlohu. Nová (N) vezme jinou.',

  'lightsOut.hotkeys.title': 'Ovládání',
  'lightsOut.hotkeys.click': 'přepnout',
  'lightsOut.hotkeys.move': 'výběr',
  'lightsOut.hotkeys.press': 'stisk',
  'lightsOut.hotkeys.hint': 'nápověda',
  'lightsOut.hotkeys.undo': 'zpět',
  'lightsOut.hotkeys.reset': 'reset',
  'lightsOut.hotkeys.new': 'nová úloha',
  'lightsOut.hotkeys.chip.click': 'klik',
  'lightsOut.hotkeys.chip.move': '↑↓←→',
  'lightsOut.hotkeys.chip.press': 'mezerník',
  'lightsOut.hotkeys.chip.hint': 'H',
  'lightsOut.hotkeys.chip.undo': '⌘Z',
  'lightsOut.hotkeys.chip.reset': 'R',
  'lightsOut.hotkeys.chip.new': 'N'
}
