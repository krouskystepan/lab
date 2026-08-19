import type { rushHourEn } from '../en/rush-hour'

export const rushHourCs: Record<keyof typeof rushHourEn, string> = {
  'rushHour.appName': 'Rush Hour',
  'rushHour.gridAria': 'Parkoviště',
  'rushHour.exit': 'Výjezd',
  'rushHour.wall': 'Blok',
  'rushHour.car.red': 'Červené auto',
  'rushHour.car.other': 'Auto {id}',
  'rushHour.diff.title': 'Obtížnost',
  'rushHour.diff.easy': 'Lehká',
  'rushHour.diff.medium': 'Střední',
  'rushHour.diff.hard': 'Těžká',
  'rushHour.diff.expert': 'Expert',
  'rushHour.diff.applyTitle': 'Nová úloha na této obtížnosti',
  'rushHour.diff.helpTitle': 'Obtížnost',
  'rushHour.diff.helpBody':
    'Těžší parkoviště potřebují víc posunů. Těžká a Expert přidají kameny, kterými auto neprojede.',
  'rushHour.time': 'Čas',
  'rushHour.timer': 'Uplynulý čas',
  'rushHour.moves': 'Tahy',
  'rushHour.movesTitle': 'Posuny / nejkratší cesta',
  'rushHour.new': 'Nová',
  'rushHour.newTitle': 'Nová úloha (N)',
  'rushHour.reset': 'Reset',
  'rushHour.resetTitle': 'Vrátit všechna auta (R)',
  'rushHour.toast.won': 'Vyřešeno za {n}.',
  'rushHour.hint.none': 'Odtud cesta není - Reset a zkus znovu.',
  'rushHour.tools.title': 'Nástroje',
  'rushHour.tools.undo': 'Zpět',
  'rushHour.tools.redo': 'Znovu',
  'rushHour.tools.undoTitle': 'Zpět poslední posun (⌘Z)',
  'rushHour.tools.redoTitle': 'Znovu (⌘⇧Z)',
  'rushHour.tools.hint': 'Tip',
  'rushHour.tools.hintTitle': 'Posunout jedno auto po nejkratší cestě (H)',
  'rushHour.tools.hintTipTitle': 'Nápověda',
  'rushHour.tools.hintTipBody':
    'Posune jedno auto tak, jak by to udělalo nejkratší řešení. Pořád to můžeš vrátit.',

  'rushHour.help.title': 'Jak hrát',
  'rushHour.help.body':
    'Posuň auta a uvolni červené, ať vyjede výjezdem vpravo. Auta jezdí jen po své délce - vodorovná doleva/doprava, svislá nahoru/dolů.',
  'rushHour.help.controls':
    'Přetáhni auto, nebo ho vyber a použij šipky. Tip (H) udělá jeden dobrý posun. Reset (R) vrátí tuto úlohu. Nová (N) vezme jinou.',

  'rushHour.hotkeys.title': 'Ovládání',
  'rushHour.hotkeys.drag': 'posun',
  'rushHour.hotkeys.move': 'o pole',
  'rushHour.hotkeys.hint': 'nápověda',
  'rushHour.hotkeys.undo': 'zpět',
  'rushHour.hotkeys.reset': 'reset',
  'rushHour.hotkeys.new': 'nová úloha',
  'rushHour.hotkeys.chip.drag': 'táhni',
  'rushHour.hotkeys.chip.move': '↑↓←→',
  'rushHour.hotkeys.chip.hint': 'H',
  'rushHour.hotkeys.chip.undo': '⌘Z',
  'rushHour.hotkeys.chip.reset': 'R',
  'rushHour.hotkeys.chip.new': 'N'
}
