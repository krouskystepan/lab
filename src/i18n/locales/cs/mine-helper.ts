import type { mineHelperEn } from '../en/mine-helper'

/** Czech */
export const mineHelperCs: Record<keyof typeof mineHelperEn, string> = {
  appName: 'Mine Helper',
  'catalog.mineHelper.title': 'Mine Helper',
  'catalog.mineHelper.blurb': 'Řešič Minesweeper desek.',
  'legend.numberSafe': 'Bezpečné #',
  'legend.numberHunt': 'Moje #',
  'legend.info': 'Info #',
  'legend.flag': 'Vlajka',
  'legend.flagHunt': 'Označené',
  'legend.safe': 'Bezpečné',
  'legend.sure': '100%',
  'legend.chance': '%',
  'legend.best': 'Nejzajímavější',
  'legend.safest': 'Nejbezpečnější',
  'legend.surestTarget': 'Nejjistější cíl',
  'legend.unclued': 'Bez nápovědy',
  'legend.menu': 'Legenda',
  'legend.menuTitle': 'Legenda značek',
  'legend.menuClose': 'Zavřít',
  'legend.menuHint': 'Klepni na značku pro podrobnosti.',
  'legend.numberTitleSafe': 'Bezpečné #',
  'legend.numberTitleHunt': 'Moje karta #',
  'legend.infoTitle': 'Info číslo',
  'legend.infoTitleHunt': 'Info #',
  'legend.flagTitle': 'Vlajka (= mina)',
  'legend.flagTitleHunt': 'Označené',
  'legend.safeTitle': 'Bezpečné',
  'legend.safeTitleHunt': 'Vyřazené',
  'goal.aria': 'Cíl řešiče',
  'goal.safe': 'Vyhnout se',
  'goal.hunt': 'Hledat cíle',
  'goal.safeTip': 'Klasické Minesweeper: hledej bezpečná pole ke kliknutí',
  'goal.huntTip': 'Hledej pole, která chceš trefit (ne ta, kterým se vyhnout)',
  'legend.sureTitleSafe': 'Jisté bezpečné',
  'legend.sureTitleHunt': 'Jistý cíl',
  'legend.chanceTitleSafe': 'Šance na bezpečné',
  'legend.chanceTitleHunt': 'Šance na cíl',
  'legend.bestTitleSafe': 'Nejzajímavější klik',
  'legend.bestTitleHunt': 'Nejzajímavější tip',
  'legend.safestTitleSafe': 'Nejbezpečnější klik',
  'legend.safestTitleHunt': 'Nejjistější tip na cíl',
  'legend.uncluedTitleSafe': 'Prázdné bez nápovědy',
  'legend.uncluedTitleHunt': 'Prázdné bez nápovědy karty',
  'legend.numberBodySafe':
    'Odhalené bezpečné pole (není mina - opak Moje # v Hledat cíle). Číslo říká, kolik min je mezi sousedy. Sem přepisuj čísla, která vidíš na desce.',
  'legend.numberBodyHunt':
    'Tvoje odhalená karta. Počítá se jako cíl. Číslo říká, kolik tvých karet je mezi sousedy (sama sebe nepočítá). ? = karta je tu, počet neznáš.',
  'legend.infoBody':
    'Jen nápověda o sousedech. Tato buňka sama není mina - kolem může být mina i nemusí, podle čísla.',
  'legend.infoBodyHunt':
    'Neutrální nebo soupeřova karta s nápovědou. Není tvoje. Číslo stejně počítá, kolik tvých karet je mezi sousedy.',
  'legend.flagBodySafe':
    'Vlajka = mina (bez čísla). Odvozené jisté miny vypadají taky jako vlajka - neklikej na ně. (Opak Hledat cíle, kde značka znamená „není tvoje“.)',
  'legend.flagBodyHunt':
    '× = tvoje karta tu 100% není (neklikej). Dává jen řešič z čísel - ručně to neoznačuješ. Tvoje cíle jsou zelené {sure}.',
  'legend.safeBody':
    'Odhalené bezpečné pole bez čísla (klasická prázdná otevřená buňka). Není mina; žádná nápověda. Když na políčku vidíš 1–8, použij Bezpečné #.',
  'legend.safeBodyHunt':
    'Vyřazené: soupeř nebo neutrál bez užitečné nápovědy. Není tvoje karta; řešič to nepočítá.',
  'legend.sureBodySafe':
    'Řešič si je jistý, že prázdná buňka je bezpečná - klikni na ni. Zobrazeno jako plně zelená buňka se {sure}.',
  'legend.sureBodyHunt':
    'Řešič si je jistý, že prázdná buňka je cíl - ber ji. Zobrazeno jako plně zelená buňka se {sure}.',
  'legend.chanceBodySafe':
    'Pravděpodobnost, že prázdná buňka je bezpečná (není mina), ze všech platných řešení. Zelenější výplň = vyšší šance na bezpečné. Stiskni Proč (W) a klepni na {chance} buňku pro A1 nápovědy.',
  'legend.chanceBodyHunt':
    'Pravděpodobnost, že prázdná buňka je cíl, ze všech platných řešení. Zelenější výplň = vyšší šance na cíl. Stiskni Proč (W) a klepni na {chance} buňku pro A1 nápovědy.',
  'legend.bestBodySafe':
    'Žlutý rámeček na {chance} buňce, jejíž odhalení ti o desce řekne nejvíc.',
  'legend.bestBodyHunt':
    'Žlutý rámeček na {chance} buňce, jejíž odhalení ti o desce řekne nejvíc.',
  'legend.safestBodySafe':
    'Oranžový rámeček + {safest} na nejvyšším bezpečném {chance}. Při remízě označí všechny se stejným %.',
  'legend.safestBodyHunt':
    'Oranžový rámeček + {surestTarget} na nejvyšší šanci na cíl {chance}. Při remízě označí všechny se stejným %.',
  'legend.uncluedBodySafe':
    'Fialový rámeček na zbývajících prázdných, kterých se žádné číslo nedotýká. Celkem pořád říká, že tam může zbývat mina, takže se o zbývající % rozdělí.',
  'legend.uncluedBodyHunt':
    'Fialový rámeček na zbývajících prázdných, kterých se žádné Moje/Info číslo nedotýká. Celkem pořád říká, že tam může zbývat karta, takže se o zbývající % rozdělí.',
  'legend.pickWhen': 'Které brát?',
  'legend.pickWhenLeftSafe': 'Nejzajímavější',
  'legend.pickWhenLeftHunt': 'Nejzajímavější',
  'legend.pickWhenRightSafe': 'Nejbezpečnější',
  'legend.pickWhenRightHunt': 'Nejjistější cíl',
  'legend.pickWhenTitle': 'Které brát?',
  'legend.pickWhenIntroSafe':
    'Na buňce je jen jedna barva. Když sedí víc tipů, vyhraje ten výš na seznamu:',
  'legend.pickWhenIntroHunt':
    'Na buňce je jen jedna barva. Když sedí víc tipů, vyhraje ten výš na seznamu:',
  'legend.pickWhenPrio1Safe': '1. {sure} - jistě bezpečné. Ty klikni nejdřív.',
  'legend.pickWhenPrio1Hunt': '1. {sure} - jistý cíl. Ty ber nejdřív.',
  'legend.pickWhenPrio2Safe':
    '2. {safest} (oranžová) - nejvyšší zbývající bezpečné %.',
  'legend.pickWhenPrio2Hunt':
    '2. {surestTarget} (oranžová) - nejvyšší zbývající % cíle.',
  'legend.pickWhenPrio3':
    '3. {best} (žlutá) - odhalení, ze kterého se o desce dozvíš nejvíc.',
  'legend.pickWhenPrio4Safe':
    '4. {unclued} (fialová) - zbývající prázdná bez blízkého čísla.',
  'legend.pickWhenPrio4Hunt':
    '4. {unclued} (fialová) - zbývající prázdná bez Moje/Info čísla.',
  'legend.pickWhenSureTitle': 'Nejdřív 100 %',
  'legend.pickWhenSureBodySafe':
    'Zelené buňky {sure} jsou jistě bezpečné. Ty klikni dřív než jakýkoli rámeček.',
  'legend.pickWhenSureBodyHunt':
    'Zelené buňky {sure} jsou jisté cíle. Ty ber dřív než jakýkoli rámeček.',
  'legend.pickWhenSafestBodySafe':
    'Nejvyšší zbývající bezpečné {chance}. Při remízě označí všechny se stejným %.',
  'legend.pickWhenSafestBodyHunt':
    'Nejvyšší zbývající šance na cíl {chance}. Při remízě označí všechny se stejným %.',
  'legend.pickWhenBestBodySafe':
    'Nejvyšší informační skóre: hlavně jak nejistá buňka je ({entropy} její {chance}), plus malý bonus za vyšší % bezpečnosti. Ber ji, když se chceš o desce dozvědět nejvíc.',
  'legend.pickWhenBestBodyHunt':
    'Nejvyšší informační skóre: hlavně jak nejistá buňka je ({entropy} její {chance}), plus malý bonus za vyšší % cíle. Ber ji, když se chceš o desce dozvědět nejvíc.',
  'legend.pickWhenUncluedBodySafe':
    'Žádné blízké číslo je nesvazuje. Když je Celkem zapnuté, zbývající miny se mezi ně rozdělí stejně.',
  'legend.pickWhenUncluedBodyHunt':
    'Žádné Moje/Info číslo se jich nedotýká. Když je Celkem zapnuté, zbývající karty se mezi ně rozdělí stejně.',
  'legend.entropy': 'entropie',
  'legend.entropySearch':
    'co je informační entropie jednoduše nejistota pravděpodobnost',
  'hotkeys.title': 'Ovládání',
  'hotkeys.pointer': 'Myš',
  'hotkeys.keyboard': 'Klávesy',
  'hotkeys.move': 'pohyb',
  'hotkeys.numberSafe': 'bezpečné #',
  'hotkeys.numberHunt': 'moje karta #',
  'hotkeys.infoDigit': 'info',
  'hotkeys.flag': 'vlajka (= mina)',
  'hotkeys.flagHunt': 'označené',
  'hotkeys.safe': 'bezpečné (bez čísla)',
  'hotkeys.safeHunt': 'vyřazené',
  'hotkeys.infoMode': 'info režim',
  'hotkeys.clear': 'smazat buňku',
  'hotkeys.place': 'položit',
  'hotkeys.solve': 'řešit',
  'hotkeys.why': 'režim Proč',
  'hotkeys.toggleOff': 'stejný znak znovu kliknutím smaže',
  'hotkeys.clearCell':
    'smaže buňku (myš: pravý klik · telefon: dlouhé podržení)',
  'hotkeys.rmbClear': 'smazat buňku',
  'hotkeys.holdClear': 'smazat buňku',
  'hotkeys.chip.again': '2× klik',
  'hotkeys.chip.rmb': 'Pravý klik',
  'hotkeys.chip.hold': 'Dlouhé podržení',
  'hotkeys.chip.up': '↑',
  'hotkeys.chip.down': '↓',
  'hotkeys.chip.left': '←',
  'hotkeys.chip.right': '→',
  'hotkeys.chip.digits': '0–8 / ?',
  'hotkeys.chip.shift': '⇧',
  'hotkeys.chip.f': 'F',
  'hotkeys.chip.b': 'B',
  'hotkeys.chip.i': 'I',
  'hotkeys.chip.x': 'X',
  'hotkeys.chip.enter': 'Enter',
  'hotkeys.chip.s': 'S',
  'hotkeys.chip.w': 'W',

  'tools.title': 'Nástroje',
  'tools.numbers': 'Čísla',
  'tools.flag': 'Vlajka',
  'tools.flagHunt': 'Označené',
  'tools.safe': 'Bezpečné',
  'tools.safeHunt': 'Vyřazené',
  'tools.info': 'Info #',
  'tools.numberSafe': 'Bezpečné',
  'tools.numberHunt': 'Moje',
  'tools.total': 'Celkem',
  'tools.auto': 'Auto',
  'tools.undo': 'Zpět',
  'tools.redo': 'Znovu',
  'tools.solve': 'Řešit',
  'tools.why': 'Proč',
  'tools.exitWhy': 'Ukončit Proč',
  'tools.reset': 'Reset',
  'tools.flagErase': 'Klikni znovu pro smazání (F)',
  'tools.flagTitle': 'Vlajka = mina (bez čísla) (F)',
  'tools.flagTitleHunt': 'Označené = 100% není tvoje, neklikej (F)',
  'tools.safeErase': 'Klikni znovu pro smazání (B)',
  'tools.safeTitle': 'Bezpečné = odhalené bez čísla (klasická prázdná) (B)',
  'tools.safeTitleHunt':
    'Vyřazené = soupeř/neutrál bez nápovědy, ignorovat (B)',
  'tools.infoTitle': 'Info číslo = jen nápověda (tato buňka není mina)',
  'tools.infoTitleHunt': 'Info # = neutrál/soupeř, nápověda o tvých kartách',
  'tools.numberTitleSafe':
    'Bezpečné # = odhalené bezpečné s číslem (miny kolem)',
  'tools.numberTitleHunt': 'Moje # = tvoje odhalená karta (počítá se jako cíl)',
  'tools.eraseAgain': 'Klikni znovu pro smazání',
  'tools.infoN': 'Info {n} (jen nápověda)',
  'tools.numberNSafe': 'Bezpečné {n}',
  'tools.numberNHunt': 'Moje karta {n}',
  'tools.numberUnknownSafe': 'Mina ? - známá mina, počet sousedů neznámý',
  'tools.numberUnknownHunt': 'Moje ? - tvoje karta, počet sousedů neznámý',
  'tools.undoTitle': 'Zpět poslední změnu (⌘Z / Ctrl+Z)',
  'tools.redoTitle': 'Znovu (⌘⇧Z / Ctrl+Shift+Z)',
  'tools.solveTitle': 'Řešit (S)',
  'tools.exitWhyTitle': 'Ukončit režim Proč (W) - deska odemčená',
  'tools.whyTitle':
    'Režim Proč (W) - zamkne desku, klepni na buňku pro vysvětlení',
  'tools.resetTitle': 'Vymazat celou desku',
  'tools.totalAria': 'Celkový počet mých karet na desce',
  'tools.totalAriaHunt': 'Celkový počet mých karet na desce',
  'tools.totalTipTitle': 'Celkem mých karet',
  'tools.totalTipTitleHunt': 'Celkem mých karet',
  'tools.totalTipBody':
    'Když je zapnuto, je to počet mých karet na celé desce - včetně už zadaných Moje. Zbývající karty jsou mezi prázdnými poli. I prázdná bez nápovědy dostanou zbývající %.',
  'tools.totalTipBodyHunt':
    'Když je zapnuto, je to počet mých karet na celé desce, včetně už zadaných Moje. Info, Vyřazené a Označené nejsou tvoje, takže se nepočítají. Zbývající karty jdou na prázdná pole - i prázdná bez nápovědy dostanou %.',
  'tools.foundHunt': 'Moje',
  'tools.foundSafe': 'Vlajky',
  'tools.foundTipHunt':
    'Kolik Moje karet už máš zadaných. Vidíš to i když je Celkem vypnuté. Tipy 100 % od řešiče se nepočítají, dokud je neoznačíš jako Moje.',
  'tools.foundTipSafe':
    'Kolik vlajek už máš zadaných. Vidíš to i když je Celkem vypnuté. Miny od řešiče se nepočítají, dokud je neoznačíš vlajkou.',
  'tools.foundAriaHunt': 'Nalezené Moje karty: {n}',
  'tools.foundAriaSafe': 'Označené miny: {n}',
  'tools.foundAriaOfHunt': 'Nalezené Moje karty: {found} z {total}',
  'tools.foundAriaOfSafe': 'Označené miny: {found} z {total}',
  'tools.autoTipTitle': 'Auto-řešení',
  'tools.autoTipBody':
    'Znovu spustí Řešit po každé úpravě a při změně Celkem, abys nemusel mačkat Řešit pořád. Vypni, pokud chceš nejdřív označit desku a řešit jednou.',
  'size.title': 'Velikost mřížky',
  'size.w': 'Š',
  'size.h': 'V',
  'size.field': 'Pole',
  'size.cardTitle': 'Poměr karty (3×2)',
  'size.squareTitle': 'Čtvercová pole',
  'size.square': '1×1',
  'size.card': 'Karta',
  'board.title': 'Deska',
  'board.addEdges': 'Přidat okraje',
  'board.shift': 'Posun',
  'board.flip': 'Překlopit',
  'board.trim': 'Oříznout prázdné',
  'board.left': 'Vlevo',
  'board.right': 'Vpravo',
  'board.top': 'Nahoře',
  'board.bottom': 'Dole',
  'board.horizontal': 'Vodorovně',
  'board.vertical': 'Svisle',
  'board.removeEdge': 'Odebrat {edge}',
  'board.addEdge': 'Přidat {edge}',
  'board.shiftUp': 'Posunout nahoru',
  'board.shiftDown': 'Posunout dolů',
  'board.shiftLeft': 'Posunout doleva',
  'board.shiftRight': 'Posunout doprava',
  'board.shiftCropConfirm':
    'Tento posun by shodil {n} označených buněk z desky. Pokračovat?',
  'board.trimTitle': 'Oříznout prázdné okrajové řádky a sloupce',
  'board.padAria': 'Přidat okraje mřížky',
  'board.shiftAria': 'Posunout značky',
  'board.flipAria': 'Překlopit desku',

  'why.aria': 'Proč tato buňka',
  'why.title': 'Proč',
  'why.heading': 'Proč {cell} je {label}',
  'why.headingCell': 'Proč {cell}',
  'why.noExplain':
    'Pro tuto buňku není vysvětlení - nejdřív zkus Řešit, nebo vyber jiné pole.',
  'why.clickCell': 'Klepni na buňku na desce a uvidíš, proč tak vypadá.',
  'why.selected': 'vybrané',
  'why.clue': 'nápověda',
  'why.linked': 'propojené',
  'why.best': 'Nejzajímavější',
  'why.safest': 'Nejbezpečnější',
  'why.surestTarget': 'Nejjistější cíl',
  'why.unclued': 'Bez nápovědy',
  'why.markAll': 'Označit vše - všechny nápovědy a propojené buňky najednou',
  'why.prev': 'Předchozí',
  'why.next': 'Další',
  'why.all': 'Vše',
  'why.relatedAria': 'Související nápovědy',
  'why.clueDetail': 'Nápověda',
  'why.numberNSafe': 'Bezpečné {n}',
  'why.numberNHunt': 'Moje {n}',
  'why.infoN': 'Info {n}',
  'block.title': 'Nelze položit',
  'block.ok': 'Rozumím',
  'grid.aria': 'Herní deska',
  'grid.best': 'Nejzajímavější',
  'grid.safest': 'Nejbezpečnější',
  'grid.surestTarget': 'Nejjistější cíl',
  'grid.unclued': 'Bez nápovědy',
  'grid.bestSafe': 'Nejzajímavější',
  'grid.bestTarget': 'Nejzajímavější',
  'solve.mismatch': 'Neshoda velikosti desky.',
  'solve.nothing':
    'Zatím nic k ukázání - přidej víc Moje/Info čísel, nebo vlajky.',
  'solve.noForced':
    'Zatím žádný jistý tah - přidej víc nápověd, nebo vypni Celkem.',
  'solve.totalIgnored':
    'Příliš mnoho prázdných polí na Celkem - beru jen blízké nápovědy.',
  'solve.contradiction':
    'Nemožné - některá čísla si odporují. Červená pole ukazují konflikt.',
  'solve.conflictPartial':
    'Některá čísla si odporují. Pořád ukazuju % z jedné nápovědy. Oprav červená pole, nebo použij Moje ? když víš jen že je buňka tvoje.',
  'val.tooMany': 'Nemožné - {value} už má vedle sebe {count} min.',
  'val.needMore':
    'Nemožné - {value} ještě potřebuje {need} {mines}, ale zbývá jen {unknowns} {neighbors}.',
  'val.both': 'Nemožné - jedna prázdná buňka by musela být mina i bezpečná.',
  'val.corner': 'Nelze položit {value} sem - roh má jen {max} sousedů.',
  'val.edge': 'Nelze položit {value} sem - okraj má jen {max} sousedů.',
  'val.max': 'Nelze položit {value} sem - maximum je {max}.',
  'val.infoNeedsNumber':
    'Info vždy potřebuje číslo - pro neznámý počet použij Moje ?',
  'val.totalOver': 'Nemožné - už je {mines} min, ale Celkem je {total}.',
  'val.totalUnder': 'Nemožné - zbývá nejvýš {max} min, ale Celkem je {total}.',
  'val.mine': 'minu',
  'val.mines': 'min',
  'val.minesFew': 'miny',
  'val.neighbor': 'prázdného souseda',
  'val.neighbors': 'prázdných sousedů',
  'val.neighborsFew': 'prázdné sousedy',
  'ex.numberSafe': 'Bezpečné',
  'ex.numberHunt': 'Moje karta',
  'ex.info': 'Info',
  'ex.flag': 'Vlajka',
  'ex.flagHunt': 'Označené',
  'ex.safe': 'Bezpečné',
  'ex.sure': '100%',
  'ex.safeLabel': 'bezpečné',
  'ex.unknown': '?',
  'ex.more': '+{n} dalších',
  'ex.clueAt': '{kind} {value} na {cell}',
  'ex.meta.forced': 'vynuceno nápovědou',
  'ex.meta.ruledOut': 'vyloučeno nápovědou',
  'ex.meta.noClue': 'žádná propojená nápověda',
  'ex.meta.tooLarge': 'příliš mnoho propojených buněk',
  'ex.meta.certain1': 'jisté · {n} rozložení',
  'ex.meta.certainN': 'jisté · {n} rozložení',
  'ex.meta.layouts': '{hits}/{total} rozložení',
  'ex.meta.layoutsSafe': 'bezpečné v {hits}/{total} rozloženích → {percent} %',
  'ex.meta.layoutsHunt':
    'tvoje karta v {hits}/{total} rozloženích → {percent} %',
  'ex.meta.placed': 'známá mina + počet sousedů',
  'ex.meta.placedSafe': 'bezpečné pole · miny mezi sousedy',
  'ex.meta.placedHunt': 'moje karta + počet sousedů',
  'ex.meta.placedUnknown': 'známá mina · počet neznámý',
  'ex.meta.placedUnknownHunt': 'moje karta · počet neznámý',
  'ex.meta.clueOnly': 'jen nápověda',
  'ex.meta.notMine': 'označeno jako ne-mina',
  'ex.meta.flagMine': 'označená mina',
  'ex.meta.flagHunt': 'tvoje karta tu není',
  'ex.meta.safeField': 'známé bezpečné pole',
  'ex.meta.safeFieldHunt': 'vyřazené pole',
  'ex.forced.need':
    '{clue} ještě potřebuje {count} {mines} a má přesně {n} {neighbors} ({open}).',
  'ex.forced.allMine':
    'Každý z nich musí být mina - včetně {cell} → mina (neklikej).',
  'ex.forced.allTargetHunt':
    'Každý z nich musí být tvoje karta - včetně {cell} → 100 % (klikni).',
  'ex.forced.need0':
    '{clue} potřebuje 0 dalších min mezi {n} {neighbors} ({open}).',
  'ex.forced.need0Hunt':
    '{clue} potřebuje 0 dalších tvých karet mezi {n} {neighbors} ({open}).',
  'ex.forced.safe': 'Takže {cell} nemůže být mina → 100 % bezpečné.',
  'ex.forced.safeHunt':
    'Takže {cell} není tvoje karta → označené × (neklikej).',
  'ex.none':
    '{cell} není vedle žádné užitečné nápovědy, takže není co odvodit.',
  'ex.large100':
    '{cell} je označené jako jistá mina, ale propojená skupina je příliš velká ({n} prázdných) na krok za krokem.',
  'ex.large100Hunt':
    '{cell} je označené jako jistý cíl, ale propojená skupina je příliš velká ({n} prázdných) na krok za krokem.',
  'ex.largeSafe':
    '{cell} je označené 100 % bezpečné, ale propojená skupina je příliš velká ({n} prázdných) na krok za krokem.',
  'ex.largeSafeHunt':
    '{cell} je označené × (ne tvoje), ale propojená skupina je příliš velká ({n} prázdných) na krok za krokem.',
  'ex.largeOther':
    '{cell} je ve velké propojené skupině ({n} prázdných). Úplný průchod rozložení není dostupný nad {max} buněk.',
  'ex.largeChance':
    '{cell} je {percent} % z blízkých nápověd. Celá propojená skupina je příliš velká ({n} prázdných) na průchod rozložení krok za krokem.',
  'ex.largeChanceHunt':
    '{cell} je z {percent} % tvoje podle blízkých nápověd. Celá propojená skupina je příliš velká ({n} prázdných) na průchod rozložení krok za krokem.',
  'ex.nearby': 'Blízké nápovědy: {clues}.',
  'ex.cluesMatter': 'Důležité nápovědy: {clues}.',
  'ex.totalLeft': 'Celkem: přesně {count} {mines} zbývá mezi prázdnými.',
  'ex.meta.totalShare': '{count} z {n} zbývajících prázdných',
  'ex.totalKnownSafe': 'Už zadané vlajky: {known} z Celkem {total}.',
  'ex.totalKnownHunt': 'Už nalezené Moje karty: {known} z Celkem {total}.',
  'ex.totalShareSafe':
    'Zbývajících {count} {mines} se rozdělí mezi {n} prázdných bez nápovědy → {percent} % bezpečné každé.',
  'ex.totalShareHunt':
    'Zbývajících {count} {mines} se rozdělí mezi {n} prázdných bez nápovědy → {percent} % každé.',
  'ex.totalAllSafe':
    '{cell} musí být mina - každé zbývající prázdné je potřeba, aby vyšlo Celkem.',
  'ex.totalAllHunt':
    '{cell} musí být tvoje karta - každé zbývající prázdné je potřeba, aby vyšlo Celkem.',
  'ex.totalNoneSafe':
    '{cell} je bezpečné - Celkem už je pokryté, takže zbývající prázdná nejsou miny.',
  'ex.totalNoneHunt':
    '{cell} není tvoje - Celkem už je pokryté, takže zbývající prázdná nejsou tvoje karty.',
  'ex.stillNeeds': '{clue} ještě potřebuje {count} mezi {open}.',
  'ex.everyLayout':
    '{cell} je mina v každém platném rozložení ({total}/{total}) → mina (neklikej).',
  'ex.everyLayoutHunt':
    '{cell} je tvoje karta v každém platném rozložení ({total}/{total}) → 100 % (klikni).',
  'ex.neverLayout':
    '{cell} není mina v žádném platném rozložení (0/{total}) → 100 % bezpečné.',
  'ex.neverLayoutHunt':
    '{cell} není tvoje karta v žádném platném rozložení (0/{total}) → označené × (neklikej).',
  'ex.someLayout':
    '{cell} je bezpečné v {hits} z {total} platných rozložení → {percent} %.',
  'ex.someLayoutHunt':
    '{cell} je tvoje karta v {hits} z {total} platných rozložení → {percent} %.',
  'ex.paired': 'Spárováno s {other}: přesně jedna z nich je mina.',
  'ex.pairedHunt': 'Spárováno s {other}: přesně jedna z nich je tvoje karta.',
  'ex.bestWhy':
    'Nejzajímavější = tip, ze kterého se o desce dozvíš nejvíc. Nemusí mít nejvyšší %.',
  'ex.bestWhyTiedDegree':
    'Stejných {percent} % mají i {peers} - všechny jsou Nejzajímavější.',
  'ex.bestWhyTiedEqual':
    'Stejně dobré tipy jsou i {peers} - všechny jsou Nejzajímavější.',
  'ex.safestWhyHunt':
    'Nejjistější cíl = tip s nejvyšší šancí, že tu je tvoje karta.',
  'ex.safestWhySafe':
    'Nejbezpečnější = tip s nejvyšší šancí, že pole je bezpečné.',
  'ex.safestWhyTied':
    'Stejných {percent} % mají i {peers} - všechny jsou označené.',
  'ex.uncluedWhyHunt':
    'Bez nápovědy = zbývající prázdné bez Moje/Info čísla. Celkem rozdělí zbývající karty mezi tyto buňky stejně.',
  'ex.uncluedWhySafe':
    'Bez nápovědy = zbývající prázdné bez blízkého čísla. Celkem rozdělí zbývající miny mezi tyto buňky stejně.',
  'ex.nothing': 'Tady není co vysvětlit.',
  'ex.placedMine':
    '{kind} {value} na {cell}: známá mina. Číslo říká, kolik min je mezi sousedy.',
  'ex.placedNumberSafe':
    '{kind} {value} na {cell}: odhalené bezpečné pole (není mina). Číslo říká, kolik min je mezi sousedy.',
  'ex.placedNumberHunt':
    '{kind} {value} na {cell}: tvoje odhalená karta. Číslo říká, kolik tvých karet je mezi sousedy.',
  'ex.placedUnknownMine':
    '{kind} ? na {cell}: známá mina, ale počet sousedů neznáš - pro okolní nápovědy se pořád počítá jako mina.',
  'ex.placedUnknownHunt':
    '{kind} ? na {cell}: tvoje karta je tu, ale počet sousedů neznáš - pro okolní nápovědy se pořád počítá jako cíl.',
  'ex.placedInfo':
    '{kind} {value} na {cell}: jen nápověda. Tato buňka není mina; číslo je o sousedech.',
  'ex.placedInfoHunt':
    '{kind} {value} na {cell}: jen nápověda. Tato buňka není tvoje; číslo říká, kolik tvých karet je mezi sousedy.',
  'ex.knownMines':
    '{known} ze sousedů už jsou miny, takže ještě {need} {verb} potřeba mezi prázdnými.',
  'ex.knownTargetsHunt':
    '{known} ze sousedů už jsou tvoje karty, takže ještě {need} {verb} potřeba mezi prázdnými.',
  'ex.allKnownOk': 'Všichni sousedé jsou známí - číslo sedí.',
  'ex.allKnownBad':
    'Nezbývají prázdní sousedé, ale číslo ještě chce {need} {mines} (nekonzistentní).',
  'ex.stillNeedEmpties':
    'Ještě potřebuje {need} {mines} mezi {n} {neighbors} ({open}).',
  'ex.equalSplit':
    'Jen z této nápovědy by každá z těch prázdných byla asi {percent} % ({need}/{n}). Stiskni Solve pro % na desce (ostatní nápovědy to můžou změnit nebo vyvrátit).',
  'ex.equalSplitHunt':
    'Jen z této nápovědy by každá z těch prázdných byla asi {percent} % ({need}/{n}). Stiskni Solve pro % na desce (ostatní nápovědy to můžou změnit nebo vyvrátit).',
  'ex.unsatEmpty':
    'Žádné platné rozložení nesedí na propojené nápovědy - odporují si. {cell} nemá co ukázat v %, dokud konflikt nevyřešíš.',
  'ex.unsatEmptyHunt':
    'Žádné platné rozložení nesedí na propojené nápovědy - odporují si. {cell} nemá cílové %, dokud konflikt nevyřešíš.',
  'ex.allSafe': 'Takže každý prázdný soused musí být bezpečný (ne mina).',
  'ex.allSafeHunt':
    'Takže každý prázdný soused musí být označené × (tvoje karta tu není).',
  'ex.allMustMine':
    'Takže každý prázdný soused musí být mina → označ vlajkou (neklikej).',
  'ex.allMustTargetHunt':
    'Takže každý prázdný soused musí být tvoje karta → 100 % (klikni).',
  'ex.flagged':
    '{cell} má vlajku: označená mina. Řešič ji bere jako známou minu.',
  'ex.flaggedHunt':
    '{cell} je označené ×: tvoje karta tu není. Řešič ji nepočítá mezi cíle.',
  'ex.flagCounts': 'Sousední čísla tuto vlajku započítají mezi známé miny.',
  'ex.flagCountsHunt':
    'Sousední čísla tuto značku nepočítají mezi tvoje karty.',
  'ex.markedSafe': '{cell} je označené jako bezpečné: není mina, bez čísla.',
  'ex.markedSafeHunt': '{cell} je vyřazené: není tvoje karta, bez čísla.',
  'ex.skipNeighbors':
    'Sousední nápovědy ho při počítání zbývajících prázdných přeskočí.',
  'ex.hint.certain': 'jistě bezpečné · {total}/{total} rozložení',
  'ex.hint.certainHunt': 'označené · {total}/{total} rozložení',
  'ex.hint.certainMine': 'jistá mina · {total}/{total} rozložení',
  'ex.hint.certainTargetHunt': 'jistý cíl · {total}/{total} rozložení',
  'ex.hint.chance': 'bezpečné v {hits}/{total} rozloženích → {percent} %',
  'ex.hint.chanceHunt':
    'tvoje karta v {hits}/{total} rozloženích → {percent} %',
  'ex.word.mine': 'minu',
  'ex.word.mines': 'min',
  'ex.word.minesFew': 'miny',
  'ex.word.target': 'tvou kartu',
  'ex.word.targets': 'tvých karet',
  'ex.word.targetsFew': 'tvoje karty',
  'ex.word.neighbor': 'souseda',
  'ex.word.neighbors': 'sousedů',
  'ex.word.neighborsFew': 'sousedy',
  'ex.word.emptyNeighbor': 'prázdného souseda',
  'ex.word.emptyNeighbors': 'prázdných sousedů',
  'ex.word.emptyNeighborsFew': 'prázdné sousedy',
  'ex.word.is': 'je',
  'ex.word.are': 'jsou',
  'ex.word.neighborIs': 'soused je',
  'ex.word.neighborsAre': 'sousedé jsou'
}
