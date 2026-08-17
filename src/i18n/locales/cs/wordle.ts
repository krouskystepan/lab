import type { wordleEn } from '../en/wordle'

export const wordleCs: Record<keyof typeof wordleEn, string> = {
  'wordle.appName': 'Wordle',
  'wordle.langNote': 'Anglická slova',
  'wordle.gridAria': 'Hrací deska Wordle',
  'wordle.diff.title': 'Obtížnost',
  'wordle.diff.easy': 'Lehká',
  'wordle.diff.medium': 'Střední',
  'wordle.diff.hard': 'Těžká',
  'wordle.diff.expert': 'Expert',
  'wordle.diff.random': 'Náhodné',
  'wordle.diff.applyTitle': 'Nové slovo na této obtížnosti',
  'wordle.diff.helpTitle': 'Obtížnost',
  'wordle.diff.helpBody':
    'Těžší nastavení bere vzácnější slova. Těžká a Expert navíc vyžadují použít zelená a žlutá písmena (tvrdý režim). Expert má pět pokusů místo šesti. Náhodné bere libovolné slovo z celého seznamu. Počet písmen je zvlášť — 4, 5, 6 nebo 7.',
  'wordle.len.title': 'Písmena',
  'wordle.len.option': '{n}',
  'wordle.len.applyTitle': 'Hrát se slovy o {n} písmenech',
  'wordle.keyboard.title': 'Klávesnice',
  'wordle.keyboard.enter': 'Enter',
  'wordle.keyboard.enterTitle': 'Odeslat tip',
  'wordle.keyboard.backspace': 'Backspace',
  'wordle.keyboard.backspaceTitle': 'Smazat poslední písmeno',
  'wordle.time': 'Čas',
  'wordle.timer': 'Uplynulý čas',
  'wordle.new': 'Nová',
  'wordle.newTitle': 'Nová hra',
  'wordle.status.won': 'Trefa!',
  'wordle.status.lost': '{word}',
  'wordle.toast.won': 'Trefil jsi na {n}.',
  'wordle.toast.lost': 'Slovo bylo {word}.',
  'wordle.short': 'Potřebuješ {n} písmen.',
  'wordle.invalid': 'Není ve slovníku.',
  'wordle.hard.green': 'Tvrdý režim: nech {letter} na pozici {n}.',
  'wordle.hard.yellow': 'Tvrdý režim: tip musí obsahovat {letter}.',
  'wordle.hint.letter': 'Písmeno {n} je {letter}.',
  'wordle.tools.title': 'Nástroje',
  'wordle.tools.hint': 'Nápověda',
  'wordle.tools.hintTitle': 'Odhalit jedno správné písmeno',
  'wordle.tools.hintTipTitle': 'Nápověda',
  'wordle.tools.hintTipBody':
    'Do rozepsaného řádku doplní jedno písmeno řešení, které ještě není zelené (bledá dlaždice). Nic se neodešle — prázdné řádky ti zůstanou.',

  'wordle.help.title': 'Jak hrát',
  'wordle.help.body':
    'Hádej slovo. Zelená je správné písmeno na správném místě. Zlatá je ve slově, ale jinde. Šedá ve slově není.',
  'wordle.help.lang':
    'Slovník je jen anglický — čeština je jen v ovládání.',
  'wordle.help.controls':
    'Piš písmena, Enter odešle, Backspace maže. Nápověda odhalí jednu zelenou. Zpět vezme poslední odeslaný tip.',
  'wordle.help.hard':
    'Těžká a Expert zapínají tvrdý režim: zelená zůstanou na místě a každé žluté písmeno musíš použít.',

  'wordle.hotkeys.title': 'Ovládání',
  'wordle.hotkeys.type': 'psát',
  'wordle.hotkeys.enter': 'odeslat',
  'wordle.hotkeys.backspace': 'smazat',
  'wordle.hotkeys.undo': 'zpět',
  'wordle.hotkeys.chip.type': 'A–Z',
  'wordle.hotkeys.chip.enter': 'Enter',
  'wordle.hotkeys.chip.backspace': '⌫',
  'wordle.hotkeys.chip.undo': '⌘Z'
}
