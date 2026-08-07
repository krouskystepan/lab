import type { minesweeperEn } from '../en/minesweeper'

export const minesweeperCs: Record<keyof typeof minesweeperEn, string> = {
  'minesweeper.appName': 'Minesweeper',
  'minesweeper.gridAria': 'Hrací deska Minesweeper',
  'minesweeper.diff.title': 'Obtížnost',
  'minesweeper.diff.beginner': 'Začátečník',
  'minesweeper.diff.intermediate': 'Střední',
  'minesweeper.diff.expert': 'Expert',
  'minesweeper.diff.crazy': 'Crazy',
  'minesweeper.diff.applyTitle':
    'Použít tuto hustotu min na aktuální velikost (nová hra)',
  'minesweeper.diff.helpTitle': 'Obtížnost',
  'minesweeper.diff.helpBody':
    'Obtížnost nastaví hustotu min na tvé velikosti - ne pevnou desku. Klasické desky: klepni na velikost (9×9, 16×16, …).',
  'minesweeper.size.title': 'Mřížka',
  'minesweeper.size.w': 'Š',
  'minesweeper.size.h': 'V',
  'minesweeper.size.wAria': 'Šířka mřížky',
  'minesweeper.size.hAria': 'Výška mřížky',
  'minesweeper.size.helpTitle': 'Velikost mřížky',
  'minesweeper.size.helpBody':
    'Zvol šířku a výšku (5–50), pak obtížnost nastaví počet min. Počet min můžeš upravit i ručně. Tlačítka velikostí přepnou na klasické desky.',
  'minesweeper.size.classicTitle': 'Klasická {w}×{h} s {mines} minami',
  'minesweeper.mines': 'Miny',
  'minesweeper.minesLeft': 'Zbývající miny',
  'minesweeper.time': 'Čas',
  'minesweeper.timer': 'Uplynulý čas',
  'minesweeper.new': 'Nová',
  'minesweeper.newTitle': 'Nová hra (N)',
  'minesweeper.status.won': 'Vyčištěno!',
  'minesweeper.status.lost': 'Bum',
  'minesweeper.tools.title': 'Nástroje',
  'minesweeper.tools.dig': 'Kop',
  'minesweeper.tools.flag': 'Vlajka',
  'minesweeper.tools.digTitle': 'Režim kopání - klik odkryje (D)',
  'minesweeper.tools.flagTitle': 'Režim vlajky - klik označí (F)',
  'minesweeper.tools.undo': 'Zpět',
  'minesweeper.tools.redo': 'Znovu',
  'minesweeper.tools.undoTitle': 'Zpět poslední tah (⌘Z / Ctrl+Z)',
  'minesweeper.tools.redoTitle': 'Znovu (⌘⇧Z / Ctrl+Shift+Z)',
  'minesweeper.tools.hint': 'Nápověda',
  'minesweeper.tools.hintTitle': 'Jeden vynucený tah (H)',
  'minesweeper.tools.hintTipTitle': 'Nápověda',
  'minesweeper.tools.hintTipBody':
    'Jen lokální logika z čísel: označí minu, která musí být, nebo odkryje jisté bezpečné pole. Neaktivní, dokud nic není vynucené.',
  'minesweeper.tools.clearFlags': 'Smazat vlajky',
  'minesweeper.tools.clearFlagsTitle': 'Odstranit všechny vlajky z desky',

  'minesweeper.help.title': 'Jak hrát',
  'minesweeper.help.body':
    'Odkryj všechna bezpečná pole bez nášlapu na minu. Číslo říká, kolik min je kolem pole.',
  'minesweeper.help.controls':
    'Klik (nebo Kop) odkrývá. Pravé tlačítko / podržení (nebo režim Vlajka) přepíná vlajku. N = nová hra. Nápověda (H) udělá jeden vynucený tah.',
  'minesweeper.help.chord':
    'Akorde: klikni na odhalené číslo, když má kolem správný počet vlajek - zbývající sousedi se otevřou.',
  'minesweeper.help.firstClick':
    'První klik je vždy bezpečný - miny se rozmístí až potom.',

  'minesweeper.hotkeys.title': 'Ovládání',
  'minesweeper.hotkeys.reveal': 'odkrýt',
  'minesweeper.hotkeys.flag': 'vlajka',
  'minesweeper.hotkeys.new': 'nová hra',
  'minesweeper.hotkeys.dig': 'režim kop',
  'minesweeper.hotkeys.flagMode': 'režim vlajka',
  'minesweeper.hotkeys.hint': 'nápověda',
  'minesweeper.hotkeys.undo': 'zpět',
  'minesweeper.hotkeys.chord': 'akorde na čísle',
  'minesweeper.hotkeys.chip.reveal': 'Klik',
  'minesweeper.hotkeys.chip.flag': 'Pravé / podržení',
  'minesweeper.hotkeys.chip.new': 'N',
  'minesweeper.hotkeys.chip.dig': 'D',
  'minesweeper.hotkeys.chip.flagMode': 'F',
  'minesweeper.hotkeys.chip.hint': 'H',
  'minesweeper.hotkeys.chip.undo': '⌘Z',
  'minesweeper.hotkeys.chip.chord': 'Klik #'
}
