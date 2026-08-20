export const mineHelperEn = {
  appName: 'Mine Helper',
  'catalog.mineHelper.title': 'Mine Helper',
  'catalog.mineHelper.blurb': 'Minesweeper board solver.',

  // Legend labels
  'legend.numberSafe': 'Safe #',
  'legend.numberHunt': 'My #',
  'legend.info': 'Info #',
  'legend.flag': 'Flag',
  'legend.flagHunt': 'Marked',
  'legend.safe': 'Safe',
  'legend.sure': '100%',
  'legend.chance': '%',
  'legend.best': 'Interesting',
  'legend.safest': 'Safest',
  'legend.surestTarget': 'Surest target',
  'legend.unclued': 'No clue',
  'legend.menu': 'Legend',
  'legend.menuTitle': 'Mark legend',
  'legend.menuClose': 'Close',
  'legend.menuHint': 'Tap a mark for details.',
  'legend.numberTitleSafe': 'Safe #',
  'legend.numberTitleHunt': 'My card #',
  'legend.infoTitle': 'Info number',
  'legend.infoTitleHunt': 'Info #',
  'legend.flagTitle': 'Flag (= mine)',
  'legend.flagTitleHunt': 'Marked',
  'legend.safeTitle': 'Safe',
  'legend.safeTitleHunt': 'Ruled out',
  'goal.aria': 'Solver goal',
  'goal.safe': 'Avoid',
  'goal.hunt': 'Find targets',
  'goal.safeTip': 'Classic Minesweeper: find safe cells to click',
  'goal.huntTip': 'Find cells you want to hit (not the ones to avoid)',
  'legend.sureTitleSafe': 'Certain safe',
  'legend.sureTitleHunt': 'Certain target',
  'legend.chanceTitleSafe': 'Safe chance',
  'legend.chanceTitleHunt': 'Target chance',
  'legend.bestTitleSafe': 'Most interesting click',
  'legend.bestTitleHunt': 'Most interesting tip',
  'legend.safestTitleSafe': 'Safest click',
  'legend.safestTitleHunt': 'Surest target tip',
  'legend.uncluedTitleSafe': 'Empty with no clue',
  'legend.uncluedTitleHunt': 'Empty with no card clue',
  'legend.numberBodySafe':
    'Revealed safe tile (not a mine - opposite of My # in Find targets). The digit is how many mines are among its neighbors. Copy the numbers you see on the board here.',
  'legend.numberBodyHunt':
    'Your revealed card. It counts as a target. The number is how many of your cards are among its neighbors (not counting itself). Use ? when the count is unknown.',
  'legend.infoBody':
    'Just a clue about neighbors. This cell itself is not a mine - around it there may or may not be mines, depending on the number.',
  'legend.infoBodyHunt':
    'Neutral or opponent card with a clue. Not your card. The number still counts how many of your cards are among its neighbors.',
  'legend.flagBodySafe':
    'Flag = mine (no number). Deduced certain mines also look like a flag - do not click them. (Opposite of Find targets, where the mark means “not yours”.)',
  'legend.flagBodyHunt':
    '× = your card is 100% not here (do not click). Only the solver marks these from numbers - you cannot place them. Your targets are green {sure}.',
  'legend.safeBody':
    'Revealed safe tile with no digit (classic empty open cell). Not a mine; no clue number. Use Safe # when the tile shows 1–8.',
  'legend.safeBodyHunt':
    'Ruled out: opponent or neutral with no useful clue. Not your card; ignored by the solver.',
  'legend.sureBodySafe':
    'Solver is sure this empty cell is safe - click it. Shown as a full green cell with {sure}.',
  'legend.sureBodyHunt':
    'Solver is sure this empty cell is a target - take it. Shown as a full green cell with {sure}.',
  'legend.chanceBodySafe':
    'Probability this empty cell is safe (not a mine), from all valid board solutions. Greener fill = higher safe chance. Press Why (W) then tap a {chance} cell for A1 clues that drive it.',
  'legend.chanceBodyHunt':
    'Probability this empty cell is a target, from all valid board solutions. Greener fill = higher target chance. Press Why (W) then tap a {chance} cell for A1 clues that drive it.',
  'legend.bestBodySafe':
    'Yellow ring on the {chance} cell whose reveal teaches you the most about the board.',
  'legend.bestBodyHunt':
    'Yellow ring on the {chance} cell whose reveal teaches you the most about the board.',
  'legend.safestBodySafe':
    'Orange ring + {safest} on the highest safe {chance}. On a tie, marks every cell with that %.',
  'legend.safestBodyHunt':
    'Orange ring + {surestTarget} on the highest target {chance}. On a tie, marks every cell with that %.',
  'legend.uncluedBodySafe':
    'Purple ring on leftover empties that no number touches. Total still says a leftover mine could be there, so they share the remaining %.',
  'legend.uncluedBodyHunt':
    'Purple ring on leftover empties that no My/Info number touches. Total still says a leftover card could be there, so they share the remaining %.',
  'legend.pickWhen': 'Which to pick?',
  'legend.pickWhenLeftSafe': 'Interesting',
  'legend.pickWhenLeftHunt': 'Interesting',
  'legend.pickWhenRightSafe': 'Safest',
  'legend.pickWhenRightHunt': 'Surest target',
  'legend.pickWhenTitle': 'Which to pick?',
  'legend.pickWhenIntroSafe':
    'Only one color per cell. If several tips apply, the highest on this list wins:',
  'legend.pickWhenIntroHunt':
    'Only one color per cell. If several tips apply, the highest on this list wins:',
  'legend.pickWhenPrio1Safe': '1. {sure} — certain safe. Click these first.',
  'legend.pickWhenPrio1Hunt': '1. {sure} — certain target. Take these first.',
  'legend.pickWhenPrio2Safe':
    '2. {safest} (orange) — highest leftover safe %.',
  'legend.pickWhenPrio2Hunt':
    '2. {surestTarget} (orange) — highest leftover target %.',
  'legend.pickWhenPrio3':
    '3. {best} (yellow) — the reveal that teaches you the most.',
  'legend.pickWhenPrio4Safe':
    '4. {unclued} (purple) — leftover empties with no nearby number.',
  'legend.pickWhenPrio4Hunt':
    '4. {unclued} (purple) — leftover empties with no My/Info number.',
  'legend.pickWhenSureTitle': '100% first',
  'legend.pickWhenSureBodySafe':
    'Green {sure} cells are certain safe. Click those before any ringed tip.',
  'legend.pickWhenSureBodyHunt':
    'Green {sure} cells are certain targets. Take those before any ringed tip.',
  'legend.pickWhenSafestBodySafe':
    'Highest safe {chance} remaining. On a tie, marks every cell with that %.',
  'legend.pickWhenSafestBodyHunt':
    'Highest target {chance} remaining. On a tie, marks every cell with that %.',
  'legend.pickWhenBestBodySafe':
    'Highest information score: mainly how uncertain the cell is ({entropy} of its {chance}), plus a small boost for higher safe %. Use when you want to learn the most about the board.',
  'legend.pickWhenBestBodyHunt':
    'Highest information score: mainly how uncertain the cell is ({entropy} of its {chance}), plus a small boost for higher target %. Use when you want to learn the most about the board.',
  'legend.pickWhenUncluedBodySafe':
    'No nearby number constrains these empties. With Total on, leftover mines are split equally among them.',
  'legend.pickWhenUncluedBodyHunt':
    'No My/Info number touches these empties. With Total on, leftover cards are split equally among them.',
  'legend.entropy': 'entropy',
  'legend.entropySearch':
    'information entropy explained simply uncertainty probability',
  'hotkeys.title': 'Controls',
  'hotkeys.pointer': 'Mouse',
  'hotkeys.keyboard': 'Keys',
  'hotkeys.move': 'move',
  'hotkeys.numberSafe': 'safe #',
  'hotkeys.numberHunt': 'my card #',
  'hotkeys.infoDigit': 'info',
  'hotkeys.flag': 'flag (= mine)',
  'hotkeys.flagHunt': 'marked',
  'hotkeys.safe': 'safe (no digit)',
  'hotkeys.safeHunt': 'ruled out',
  'hotkeys.infoMode': 'info mode',
  'hotkeys.clear': 'clear cell',
  'hotkeys.place': 'place',
  'hotkeys.solve': 'solve',
  'hotkeys.why': 'why mode',
  'hotkeys.toggleOff': 'click the same mark again to erase it',
  'hotkeys.clearCell': 'erase cell (mouse: right-click · phone: long-press)',
  'hotkeys.rmbClear': 'erase cell',
  'hotkeys.holdClear': 'erase cell',
  'hotkeys.chip.again': '2× click',
  'hotkeys.chip.rmb': 'Right-click',
  'hotkeys.chip.hold': 'Long-press',
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

  'tools.title': 'Tools',
  'tools.numbers': 'Numbers',
  'tools.flag': 'Flag',
  'tools.flagHunt': 'Marked',
  'tools.safe': 'Safe',
  'tools.safeHunt': 'Ruled out',
  'tools.info': 'Info #',
  'tools.numberSafe': 'Safe',
  'tools.numberHunt': 'My',
  'tools.total': 'Total',
  'tools.auto': 'Auto',
  'tools.undo': 'Undo',
  'tools.redo': 'Redo',
  'tools.solve': 'Solve',
  'tools.why': 'Why',
  'tools.exitWhy': 'Exit Why',
  'tools.reset': 'Reset',
  'tools.flagErase': 'Click again to erase (F)',
  'tools.flagTitle': 'Flag = mine (no number) (F)',
  'tools.flagTitleHunt': 'Marked = 100% not yours, do not click (F)',
  'tools.safeErase': 'Click again to erase (B)',
  'tools.safeTitle': 'Safe = revealed safe with no digit (classic empty) (B)',
  'tools.safeTitleHunt':
    'Ruled out = opponent/neutral with no clue, ignore (B)',
  'tools.infoTitle': 'Info number = clue only (this cell is not a mine)',
  'tools.infoTitleHunt': 'Info # = neutral/opponent clue about your cards',
  'tools.numberTitleSafe':
    'Safe # = revealed safe tile with a digit (mines around it)',
  'tools.numberTitleHunt':
    'My card # = your revealed card (counts as a target)',
  'tools.eraseAgain': 'Click again to erase',
  'tools.infoN': 'Info {n} (clue only)',
  'tools.numberNSafe': 'Safe {n}',
  'tools.numberNHunt': 'My card {n}',
  'tools.numberUnknownSafe': 'Mine ? - known mine, neighbor count unknown',
  'tools.numberUnknownHunt': 'My ? - your card, neighbor count unknown',
  'tools.undoTitle': 'Undo last board change (⌘Z / Ctrl+Z)',
  'tools.redoTitle': 'Redo (⌘⇧Z / Ctrl+Shift+Z)',
  'tools.solveTitle': 'Solve (S)',
  'tools.exitWhyTitle': 'Exit Why mode (W) - board unlocked',
  'tools.whyTitle': 'Why mode (W) - lock board, tap any cell for explanation',
  'tools.resetTitle': 'Clear entire board',
  'tools.totalAria': 'Total mines on the board',
  'tools.totalAriaHunt': 'Total of your cards on the board',
  'tools.totalTipTitle': 'Total mines',
  'tools.totalTipTitleHunt': 'Total cards',
  'tools.totalTipBody':
    'When on, this is the mine count for the whole board - including flags you already placed. Remaining mines are among empty cells. Empties with no nearby clue still get a leftover %.',
  'tools.totalTipBodyHunt':
    'When on, this is how many of your cards are on the whole board, including My cards you already placed. Info, Ruled out, and Marked are not yours, so they do not count. Remaining cards go on empty cells - even empties with no clue get a %.',
  'tools.foundHunt': 'My',
  'tools.foundSafe': 'Flags',
  'tools.foundTipHunt':
    'My cards you already placed. Shown even when Total is off. Solver 100% tips are not counted until you mark them My.',
  'tools.foundTipSafe':
    'Flags you already placed. Shown even when Total is off. Solver mine marks are not counted until you flag them.',
  'tools.foundAriaHunt': 'My cards found: {n}',
  'tools.foundAriaSafe': 'Mines flagged: {n}',
  'tools.foundAriaOfHunt': 'My cards found: {found} of {total}',
  'tools.foundAriaOfSafe': 'Mines flagged: {found} of {total}',
  'tools.autoTipTitle': 'Auto-solve',
  'tools.autoTipBody':
    'Re-runs Solve after each board edit and when Total changes, so you do not have to press Solve every time. Turn off if you want to mark the board first and solve once.',
  'size.title': 'Grid size',
  'size.w': 'W',
  'size.h': 'H',
  'size.field': 'Field',
  'size.cardTitle': 'Card aspect (3×2)',
  'size.squareTitle': 'Square cells',
  'size.square': '1×1',
  'size.card': 'Card',
  'board.title': 'Board',
  'board.addEdges': 'Add edges',
  'board.shift': 'Shift',
  'board.flip': 'Flip',
  'board.trim': 'Trim empty',
  'board.left': 'Left',
  'board.right': 'Right',
  'board.top': 'Top',
  'board.bottom': 'Bottom',
  'board.horizontal': 'Horizontal',
  'board.vertical': 'Vertical',
  'board.removeEdge': 'Remove {edge}',
  'board.addEdge': 'Add {edge}',
  'board.shiftUp': 'Shift up',
  'board.shiftDown': 'Shift down',
  'board.shiftLeft': 'Shift left',
  'board.shiftRight': 'Shift right',
  'board.shiftCropConfirm':
    'This shift would drop {n} marked cell(s) off the board. Continue?',
  'board.trimTitle': 'Crop empty border rows and columns',
  'board.padAria': 'Pad grid edges',
  'board.shiftAria': 'Shift marks',
  'board.flipAria': 'Flip board',

  'why.aria': 'Why this cell',
  'why.title': 'Why',
  'why.heading': 'Why {cell} is {label}',
  'why.headingCell': 'Why {cell}',
  'why.noExplain':
    'No explanation for this cell - try Solve first, or pick another field.',
  'why.clickCell': 'Click a cell on the board to see why it looks that way.',
  'why.selected': 'selected',
  'why.clue': 'clue',
  'why.linked': 'linked',
  'why.best': 'Interesting',
  'why.safest': 'Safest',
  'why.surestTarget': 'Surest target',
  'why.unclued': 'No clue',
  'why.markAll': 'Mark all - every clue and linked cell at once',
  'why.prev': 'Prev',
  'why.next': 'Next',
  'why.all': 'All',
  'why.relatedAria': 'Related clues',
  'why.clueDetail': 'Clue',
  'why.numberNSafe': 'Safe {n}',
  'why.numberNHunt': 'My {n}',
  'why.infoN': 'Info {n}',
  'block.title': 'Can’t place that',
  'block.ok': 'Got it',
  'grid.aria': 'Mine board',
  'grid.best': 'Interesting',
  'grid.safest': 'Safest',
  'grid.surestTarget': 'Surest target',
  'grid.unclued': 'No clue',
  'grid.bestSafe': 'Interesting',
  'grid.bestTarget': 'Interesting',

  // Solve notices
  'solve.mismatch': 'Board size mismatch.',
  'solve.nothing': 'Nothing to show yet - add more My/Info numbers, or flags.',
  'solve.noForced':
    'No sure moves yet - add more clues, or turn Total off if it is on.',
  'solve.totalIgnored':
    'Too many empty cells to use Total - using nearby clues only.',
  'solve.contradiction':
    'Impossible - some numbers disagree. Red cells show the conflict.',
  'solve.conflictPartial':
    'Some numbers disagree. Still showing % from one clue. Fix the red cells, or use My ? if you only know that cell is yours.',

  // Validate
  'val.tooMany':
    'Impossible - the {value} already has {count} mines next to it.',
  'val.needMore':
    'Impossible - the {value} still needs {need} {mines} but only {unknowns} {neighbors} left.',
  'val.both': 'Impossible - one empty would have to be both a mine and safe.',
  'val.corner': 'Can’t place {value} here - corners only have {max} neighbors.',
  'val.edge': 'Can’t place {value} here - edges only have {max} neighbors.',
  'val.max': 'Can’t place {value} here - max is {max}.',
  'val.infoNeedsNumber':
    'Info always needs a number - use My ? for unknown count.',
  'val.totalOver': 'Impossible - already {mines} mines but Total is {total}.',
  'val.totalUnder':
    'Impossible - at most {max} mines left but Total is {total}.',
  'val.mine': 'mine',
  'val.mines': 'mines',
  'val.minesFew': 'mines',
  'val.neighbor': 'empty neighbor',
  'val.neighbors': 'empty neighbors',
  'val.neighborsFew': 'empty neighbors',

  // Explain shared
  'ex.numberSafe': 'Safe',
  'ex.numberHunt': 'My card',
  'ex.info': 'Info',
  'ex.flag': 'Flag',
  'ex.flagHunt': 'Marked',
  'ex.safe': 'Safe',
  'ex.sure': '100%',
  'ex.safeLabel': 'safe',
  'ex.unknown': '?',
  'ex.more': '+{n} more',
  'ex.clueAt': '{kind} {value} at {cell}',
  'ex.meta.forced': 'forced by clue',
  'ex.meta.ruledOut': 'ruled out by clue',
  'ex.meta.noClue': 'no linked clue',
  'ex.meta.tooLarge': 'too many linked cells',
  'ex.meta.certain1': 'certain · {n} layout',
  'ex.meta.certainN': 'certain · {n} layouts',
  'ex.meta.layouts': '{hits}/{total} layouts',
  'ex.meta.layoutsSafe': 'safe in {hits}/{total} layouts → {percent}%',
  'ex.meta.layoutsHunt': 'your card in {hits}/{total} layouts → {percent}%',
  'ex.meta.placed': 'known mine + neighbor count',
  'ex.meta.placedSafe': 'safe tile · mines among neighbors',
  'ex.meta.placedHunt': 'my card + neighbor count',
  'ex.meta.placedUnknown': 'known mine · count unknown',
  'ex.meta.placedUnknownHunt': 'my card · count unknown',
  'ex.meta.clueOnly': 'clue only',
  'ex.meta.notMine': 'marked not a mine',
  'ex.meta.flagMine': 'marked mine',
  'ex.meta.flagHunt': 'your card is not here',
  'ex.meta.safeField': 'known safe field',
  'ex.meta.safeFieldHunt': 'ruled-out field',
  'ex.forced.need':
    '{clue} still needs {count} {mines} and has exactly {n} {neighbors} ({open}).',
  'ex.forced.allMine':
    'Every one of those must be a mine - including {cell} → mine (do not click).',
  'ex.forced.allTargetHunt':
    'Every one of those must be your card - including {cell} → 100% (click).',
  'ex.forced.need0':
    '{clue} needs 0 more mines among {n} {neighbors} ({open}).',
  'ex.forced.need0Hunt':
    '{clue} needs 0 more of your cards among {n} {neighbors} ({open}).',
  'ex.forced.safe': 'So {cell} cannot be a mine → 100% safe.',
  'ex.forced.safeHunt': 'So {cell} is not your card → marked × (do not click).',
  'ex.none':
    '{cell} isn’t next to any useful clue, so there’s nothing to deduce.',
  'ex.large100':
    '{cell} is marked as a certain mine, but the linked group is too large ({n} empties) to show every layout step-by-step.',
  'ex.large100Hunt':
    '{cell} is marked as a certain target, but the linked group is too large ({n} empties) to show every layout step-by-step.',
  'ex.largeSafe':
    '{cell} is marked 100% safe, but the linked group is too large ({n} empties) to show every layout step-by-step.',
  'ex.largeSafeHunt':
    '{cell} is marked × (not yours), but the linked group is too large ({n} empties) to show every layout step-by-step.',
  'ex.largeOther':
    '{cell} sits in a large linked group ({n} empties). A full layout walkthrough isn’t available past {max} cells.',
  'ex.nearby': 'Nearby clues: {clues}.',
  'ex.cluesMatter': 'Clues that matter: {clues}.',
  'ex.totalLeft': 'Total: exactly {count} {mines} left among empties.',
  'ex.meta.totalShare': '{count} of {n} leftover empties',
  'ex.totalKnownSafe': 'Flags already placed: {known} of Total {total}.',
  'ex.totalKnownHunt': 'My cards already found: {known} of Total {total}.',
  'ex.totalShareSafe':
    'The leftover {count} {mines} are shared among {n} empty cells with no clue → {percent}% safe each.',
  'ex.totalShareHunt':
    'The leftover {count} {mines} are shared among {n} empty cells with no clue → {percent}% each.',
  'ex.totalAllSafe':
    '{cell} must be a mine - every leftover empty is needed to reach Total.',
  'ex.totalAllHunt':
    '{cell} must be your card - every leftover empty is needed to reach Total.',
  'ex.totalNoneSafe':
    '{cell} is safe - Total is already accounted for, so leftover empties are not mines.',
  'ex.totalNoneHunt':
    '{cell} is not yours - Total is already accounted for, so leftover empties are not your cards.',
  'ex.stillNeeds': '{clue} still needs {count} among {open}.',
  'ex.everyLayout':
    '{cell} is a mine in every valid layout ({total}/{total}) → mine (do not click).',
  'ex.everyLayoutHunt':
    '{cell} is your card in every valid layout ({total}/{total}) → 100% (click).',
  'ex.neverLayout':
    '{cell} is never a mine in any valid layout (0/{total}) → 100% safe.',
  'ex.neverLayoutHunt':
    '{cell} is never your card in any valid layout (0/{total}) → marked × (do not click).',
  'ex.someLayout':
    '{cell} is safe in {hits} of {total} valid layouts → {percent}%.',
  'ex.someLayoutHunt':
    '{cell} is your card in {hits} of {total} valid layouts → {percent}%.',
  'ex.paired': 'Paired with {other}: exactly one of the two is a mine.',
  'ex.pairedHunt': 'Paired with {other}: exactly one of the two is your card.',
  'ex.bestWhy':
    'Interesting = the tip that teaches you the most about the board. Not always the highest %.',
  'ex.bestWhyTiedDegree':
    'Same {percent}% also on {peers} - all are Interesting.',
  'ex.bestWhyTiedEqual':
    'Equally good tips also on {peers} - all are Interesting.',
  'ex.safestWhyHunt':
    'Surest target = the tip with the highest chance your card is here.',
  'ex.safestWhySafe':
    'Safest = the tip with the highest chance the cell is safe.',
  'ex.safestWhyTied': 'Same {percent}% also on {peers} - all are marked.',
  'ex.uncluedWhyHunt':
    'No clue = leftover empty with no My/Info number. Total splits remaining cards equally among these cells.',
  'ex.uncluedWhySafe':
    'No clue = leftover empty with no nearby number. Total splits remaining mines equally among these cells.',
  'ex.nothing': 'Nothing to explain here.',
  'ex.placedMine':
    '{kind} {value} at {cell}: a known mine. The number is how many mines are among its neighbors.',
  'ex.placedNumberSafe':
    '{kind} {value} at {cell}: revealed safe tile (not a mine). The digit is how many mines are among its neighbors.',
  'ex.placedNumberHunt':
    '{kind} {value} at {cell}: your revealed card. The number is how many of your cards are among its neighbors.',
  'ex.placedUnknownMine':
    '{kind} ? at {cell}: a known mine, but the neighbor count is unknown - it still counts as a mine for nearby clues.',
  'ex.placedUnknownHunt':
    '{kind} ? at {cell}: your card is here, but the neighbor count is unknown - it still counts as a target for nearby clues.',
  'ex.placedInfo':
    '{kind} {value} at {cell}: clue only. This cell is not a mine; the number is about its neighbors.',
  'ex.placedInfoHunt':
    '{kind} {value} at {cell}: clue only. This cell is not yours; the number is how many of your cards are among its neighbors.',
  'ex.knownMines':
    '{known} of the neighbors are already mines, so {need} more {verb} needed among empties.',
  'ex.knownTargetsHunt':
    '{known} of the neighbors are already your cards, so {need} more {verb} needed among empties.',
  'ex.allKnownOk': 'All neighbors are known - the number checks out.',
  'ex.allKnownBad':
    'No empty neighbors left, but the number still wants {need} more {mines} (inconsistent).',
  'ex.stillNeedEmpties':
    'Still needs {need} {mines} among {n} {neighbors} ({open}).',
  'ex.equalSplit':
    'From this clue alone, each of those empties would be about {percent}% ({need}/{n}). Press Solve to see board % (other clues can change or rule that out).',
  'ex.equalSplitHunt':
    'From this clue alone, each of those empties would be about {percent}% ({need}/{n}). Press Solve to see board % (other clues can change or rule that out).',
  'ex.unsatEmpty':
    'No valid board layout fits the linked clues - they contradict each other. {cell} has no % to show until the conflict is fixed.',
  'ex.unsatEmptyHunt':
    'No valid board layout fits the linked clues - they contradict each other. {cell} has no target % to show until the conflict is fixed.',
  'ex.allSafe': 'So every empty neighbor must be safe (not a mine).',
  'ex.allSafeHunt':
    'So every empty neighbor must be marked × (your card is not there).',
  'ex.allMustMine':
    'So every empty neighbor must be a mine → flag them (do not click).',
  'ex.allMustTargetHunt':
    'So every empty neighbor must be your card → 100% (click).',
  'ex.flagged':
    '{cell} is flagged: a marked mine. The solver counts it as a known mine.',
  'ex.flaggedHunt':
    '{cell} is marked ×: your card is not here. The solver does not count it as a target.',
  'ex.flagCounts':
    'Neighbor numbers include this flag when counting known mines.',
  'ex.flagCountsHunt':
    'Neighbor numbers do not count this mark among your cards.',
  'ex.markedSafe': '{cell} is marked safe: not a mine, no clue number.',
  'ex.markedSafeHunt': '{cell} is ruled out: not your card, no clue number.',
  'ex.skipNeighbors': 'Neighbor clues skip it when counting remaining empties.',
  'ex.hint.certain': 'certain safe · {total}/{total} layouts',
  'ex.hint.certainHunt': 'marked · {total}/{total} layouts',
  'ex.hint.certainMine': 'certain mine · {total}/{total} layouts',
  'ex.hint.certainTargetHunt': 'certain target · {total}/{total} layouts',
  'ex.hint.chance': 'safe in {hits}/{total} layouts → {percent}%',
  'ex.hint.chanceHunt': 'your card in {hits}/{total} layouts → {percent}%',
  'ex.word.mine': 'mine',
  'ex.word.mines': 'mines',
  'ex.word.minesFew': 'mines',
  'ex.word.target': 'of your cards',
  'ex.word.targets': 'of your cards',
  'ex.word.targetsFew': 'of your cards',
  'ex.word.neighbor': 'neighbor',
  'ex.word.neighbors': 'neighbors',
  'ex.word.neighborsFew': 'neighbors',
  'ex.word.emptyNeighbor': 'empty neighbor',
  'ex.word.emptyNeighbors': 'empty neighbors',
  'ex.word.emptyNeighborsFew': 'empty neighbors',
  'ex.word.is': 'is',
  'ex.word.are': 'are',
  'ex.word.neighborIs': 'neighbor is',
  'ex.word.neighborsAre': 'neighbors are'
} as const
