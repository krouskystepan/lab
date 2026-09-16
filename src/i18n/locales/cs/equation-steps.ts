import type { equationStepsEn } from '../en/equation-steps'

export const equationStepsCs: Record<keyof typeof equationStepsEn, string> = {
  'equationSteps.appName': 'Kroky rovnice',
  'equationSteps.stageAria': 'Postup řešení rovnice',

  'equationSteps.input.label': 'Rovnice',
  'equationSteps.input.placeholder': '2x + 5 = 13',
  'equationSteps.input.helpTitle': 'Jak to napsat',
  'equationSteps.input.helpBody':
    'Jedna neznámá (x, y, t…). Lineární a kvadratické, |abs|, √, a sin/cos (včetně x = cos α, když je tam √(1 − x²)).',
  'equationSteps.chars.intro':
    'Piš prostřední sloupec. Znaky v posledním sloupci jsou jen ozdoba — znamenají totéž.',
  'equationSteps.chars.mean': 'Znamená',
  'equationSteps.chars.type': 'Piš',
  'equationSteps.chars.also': 'I toto',
  'equationSteps.chars.plus': 'plus',
  'equationSteps.chars.minus': 'mínus',
  'equationSteps.chars.times': 'krát',
  'equationSteps.chars.div': 'děleno',
  'equationSteps.chars.pow': 'mocnina',
  'equationSteps.chars.eq': 'rovná se',
  'equationSteps.chars.paren': 'závorky',
  'equationSteps.chars.dec': 'desetinná',
  'equationSteps.chars.unk': 'neznámá',
  'equationSteps.chars.abs': 'absolutní hodnota',
  'equationSteps.chars.sqrt': 'odmocnina',
  'equationSteps.chars.sin': 'sinus',
  'equationSteps.chars.cos': 'kosinus',
  'equationSteps.chars.pi': 'pí',

  'equationSteps.tools.solve': 'Řešit',
  'equationSteps.tools.solveTitle': 'Projít kroky (S / Enter)',

  'equationSteps.pad.x': 'Neznámá x',
  'equationSteps.pad.plus': 'Plus',
  'equationSteps.pad.minus': 'Minus',
  'equationSteps.pad.times': 'Krát',
  'equationSteps.pad.div': 'Děleno',
  'equationSteps.pad.lparen': 'Závorka',
  'equationSteps.pad.rparen': 'Závorka',
  'equationSteps.pad.eq': 'Rovná se',
  'equationSteps.pad.pow': 'Mocnina',
  'equationSteps.pad.abs': 'Absolutní hodnota',
  'equationSteps.pad.sqrt': 'Odmocnina',
  'equationSteps.pad.sin': 'Sinus',
  'equationSteps.pad.cos': 'Kosinus',
  'equationSteps.pad.pi': 'Pí',
  'equationSteps.pad.back': 'Smazat',

  'equationSteps.setup.title': 'Příklady',
  'equationSteps.preset.helpTitle': 'Příklady',
  'equationSteps.preset.helpBody':
    'Načte typickou školní rovnici a vyřeší ji. Dva kroky, závorky, zlomky, neznámá na obou stranách, pak kvadratická, která se dá rozložit.',
  'equationSteps.preset.twoStep': 'Dva kroky',
  'equationSteps.preset.distribute': 'Závorky',
  'equationSteps.preset.fractions': 'Zlomky',
  'equationSteps.preset.bothSides': 'Obě strany',
  'equationSteps.preset.quadratic': 'Kvadratická',
  'equationSteps.preset.circle': '|x+√|',

  'equationSteps.help.title': 'Kroky rovnice',
  'equationSteps.help.body':
    'Napiš rovnici a stiskni Řešit. Seznam je celý postup — roznásob, zbav se zlomků, přesuň členy, vyděl. Klepni na řádek, nebo N / P, a zvýrazni úpravu.',
  'equationSteps.help.steps':
    'Seznam je krátké shrnutí. Klepni na řádek a vpravo je delší proč — co se stalo a proč obě strany zůstanou stejné.',

  'equationSteps.toast.solved': 'Vyřešeno',
  'equationSteps.result.idle': 'Napiš rovnici a stiskni Řešit.',
  'equationSteps.result.solved': 'Vyřešeno',
  'equationSteps.result.identity': 'Platí pro každé číslo.',
  'equationSteps.result.none': 'Řešení neexistuje.',
  'equationSteps.result.empty': 'Nejdřív napiš rovnici.',
  'equationSteps.result.parse': 'Tohle nepřečtu. Zkontroluj závorky a rovnítko.',
  'equationSteps.result.multiVar': 'Jen jedna neznámá najednou — vidím víc písmen.',
  'equationSteps.result.varInDenom':
    'Neznámá je ve jmenovateli. Zkus obě strany vynásobit, nebo to přepiš jako ax + b = c.',
  'equationSteps.result.highDegree': 'Po zbavení odmocnin umím jen lineární a kvadratické.',
  'equationSteps.result.badPower': 'Mocniny musí být malá celá čísla (x², (x+1)²).',
  'equationSteps.result.radical':
    'Tuhle směs odmocnin neočistím. Zkus jednu odmocninu, nebo tvar |A| = B.',

  'equationSteps.steps.item': 'Krok {n}: {label}',

  'equationSteps.reason.start': 'Začínám od toho, co jsi napsal.',
  'equationSteps.reason.expand': 'Roznásobím závorky a sečtu podobné členy.',
  'equationSteps.reason.simplify': 'Aritmetika, podle pořadí operací.',
  'equationSteps.reason.swap': 'Neznámou dám nalevo.',
  'equationSteps.reason.clearDenom': 'Obě strany vynásobím číslem {n}, ať zmizí jmenovatelé.',
  'equationSteps.reason.subBoth': 'Od obou stran odečtu {term}.',
  'equationSteps.reason.addBoth': 'K oběma stranám přičtu {term}.',
  'equationSteps.reason.divBoth': 'Obě strany vydělím číslem {n}.',
  'equationSteps.reason.mulBoth': 'Obě strany vynásobím číslem {n}.',
  'equationSteps.reason.factor': 'Kvadratický výraz rozložím na součin lineárních členů.',
  'equationSteps.reason.zeroProduct':
    'Součin je nula, jen když je nula aspoň jeden činitel. Každý vyřeším zvlášť.',
  'equationSteps.reason.sqrt': 'Z obou stran odmocním (a nechám ±). √{n} je zjednodušené.',
  'equationSteps.reason.quadratic': 'Kvadratický vzorec. Diskriminant Δ = {disc}.',
  'equationSteps.reason.identity': 'Obě strany jsou stejné. Platí to pro každé reálné číslo.',
  'equationSteps.reason.none': 'Strany se nemůžou rovnat. Řešení neexistuje.',
  'equationSteps.reason.absSplit':
    '|A| = B znamená A = B nebo A = −B, a B nesmí být záporné.',
  'equationSteps.reason.isolate': 'Přehodím zbylé členy, ať odmocnina (nebo abs) zůstane sama.',
  'equationSteps.reason.square':
    'Obě strany umocním na druhou. Nechám jen hodnoty, kde odmocnina dává smysl a druhá strana je ≥ 0.',
  'equationSteps.reason.check':
    'Umocnění (a rozpad abs) umí přidat falešné kořeny. Dosadím do původní a falešné zahodím.',
  'equationSteps.reason.subst':
    'Neznámou nahradím kosinem, ať se zbylá odmocnina stane sinem.',
  'equationSteps.reason.trigId':
    'Identita: 2cos²θ − 1 = cos 2θ, a cos θ + sin θ = √2 sin(θ + π/4).',
  'equationSteps.reason.backSub':
    'Vrátím úhel zpátky a vezmu kosinus, ať mám zase původní neznámou.',

  'equationSteps.depth.aria': 'Proč tento krok',
  'equationSteps.depth.title': 'Krok {n}',
  'equationSteps.depth.from': 'Z',
  'equationSteps.depth.start':
    'Tohle je rovnice, jak byla napsaná. Ještě se nic nepřepisovalo.\nCíl je osamostatnit neznámou na jedné straně a číslo na druhé — jen úpravami, které nechají obě strany stejné.',
  'equationSteps.depth.expand':
    'Závorky znamenají násobení: a(b + c) je ab + ac. Pak se sečtou podobné členy — x-části k sobě, čísla k sobě.\nHodnota stran se nemění, rovnítko pořád platí.',
  'equationSteps.depth.simplify':
    'Jen aritmetika, v obvyklém pořadí: nejdřív mocniny, pak × a ÷, pak + a −.\nŽádné členy ještě nepřecházely přes rovnítko.',
  'equationSteps.depth.swap':
    'Rovnítko je souměrné: když A = B, pak B = A. Prohození stran nemění řešení.\nNeznámá nalevo je jen zvyk, ať se další řádky čtou zleva doprava.',
  'equationSteps.depth.clearDenom':
    'Každý člen na obou stranách se násobí číslem {n}. Zlomek, jehož jmenovatel {n} dělí, se stane celým číslem.\nStejný násobek na obou stranách rovnost drží: když a = b, pak {n}a = {n}b.',
  'equationSteps.depth.subBoth':
    'Od levé i od pravé strany odečti {term}. Když a = b, pak a − {term} = b − {term}.\nTím se {term} vyruší, kde sedělo, a množina řešení se nemění.',
  'equationSteps.depth.addBoth':
    'K oběma stranám přičti {term}. Když a = b, pak a + {term} = b + {term}.\nTím se vyruší opačný člen (mínus, které překáželo).',
  'equationSteps.depth.divBoth':
    'Obě strany vyděl číslem {n}. Když a = b a {n} není nula, pak a/{n} = b/{n}.\nKoeficient u neznámé je 1 — to už je osamostatněný výsledek.',
  'equationSteps.depth.mulBoth':
    'Obě strany vynásob číslem {n}. Stejný činitel na obou stranách rovnost drží.\nTypicky: otočit vedoucí minus (× −1), nebo zrušit zbývající zlomek.',
  'equationSteps.depth.factor':
    'Kvadratický výraz se přepíše na součin dvou lineárních kusů, které se zpátky vynásobí na původní.\nStejná rovnice, jiný tvar — připravená na větu o nulovém součinu.',
  'equationSteps.depth.zeroProduct':
    'Součin je nula, jen když je nula aspoň jeden činitel. Jinak dvě čísla nulu nedají.\nKaždý lineární činitel se položí rovný nule a vyřeší. To jsou všechny kořeny.',
  'equationSteps.depth.sqrt':
    'Když x² = {n} a {n} je kladné, jsou dvě reálná řešení: hlavní odmocnina a její opak.\nZnak ± drží i záporný kořen; bez něj by jedno řešení vypadlo.',
  'equationSteps.depth.quadratic':
    'Kvadratický vzorec řeší ax² + bx + c = 0 pro a ≠ 0: x = (−b ± √Δ) / (2a).\nΔ = {disc} je b² − 4ac. Dva reálné kořeny při Δ > 0, jeden při Δ = 0, žádný při Δ < 0.',
  'equationSteps.depth.identity':
    'Po vyrušení jsou obě strany stejná pravdivá rovnost (0 = 0).\nKaždé reálné číslo za neznámou funguje — původní rovnice byla identita.',
  'equationSteps.depth.none':
    'Po vyrušení zbude nepravdivá rovnost (třeba 0 = 1).\nŽádná hodnota neznámé to nespraví, takže řešení neexistuje.',
  'equationSteps.depth.absSplit':
    'Absolutní hodnota je vzdálenost od nuly: |A| = B jen když B ≥ 0, a pak A je B nebo −B.\nTy dvě obyčejné rovnice se řeší zvlášť; co nesedí do původní, později vyhodíme.',
  'equationSteps.depth.isolate':
    'Stejné jako přesouvání členů přes rovnítko: odečti všechno, co není odmocnina.\nAž √u sedí samo, umocnění je v pořádku jen když jsou obě strany ≥ 0.',
  'equationSteps.depth.square':
    'Když √u = v a v ≥ 0, pak u = v². Umocnění nejde vrátit, takže můžou přibýt kořeny navíc.\nUvnitř u musí zůstat ≥ 0 — to je definiční obor původní odmocniny.',
  'equationSteps.depth.check':
    'Každý kandidát se dosadí do rovnice, jak byla napsaná, včetně abs a odmocnin.\nKdyž strana není definovaná (záporno pod odmocninou) nebo se strany neshodují, kandidát padá.',
  'equationSteps.depth.subst':
    'Na [0, π] kosinus pokryje každé x z [−1, 1] jednou a sinus je ≥ 0, takže sedí na √(1 − x²).\nPůvodní rovnice je stejné tvrzení, jen v α.',
  'equationSteps.depth.trigId':
    'cos 2θ = 2cos²θ − 1 je dvojnásobný úhel. cos θ + sin θ je √2 krát sin(θ + π/4), protože sin(θ+π/4) = (sin θ + cos θ)/√2.\nDělení √2 řešení nemění. Pak cos 2α = sin 2β po posunu β = α + π/4.',
  'equationSteps.depth.backSub':
    'α = β − π/4, potom x = cos α. Tabulka: cos(π/12) = (√6 + √2)/4, cos(3π/4) = −√2/2.\nPořád musí projít původní rovnicí (absolutní hodnota a znaménko pravé strany).',

  'equationSteps.graph.aria': 'Graf obou stran',
  'equationSteps.graph.title': 'Graf',
  'equationSteps.graph.zoomIn': 'Přiblížit',
  'equationSteps.graph.zoomOut': 'Oddálit',
  'equationSteps.graph.zoomReset': 'Výchozí zoom',
  'equationSteps.hotkeys.title': 'Ovládání',
  'equationSteps.hotkeys.solve': 'řešit',
  'equationSteps.hotkeys.next': 'další krok',
  'equationSteps.hotkeys.prev': 'předchozí krok',
  'equationSteps.hotkeys.chip.solve': 'S',
  'equationSteps.hotkeys.chip.next': 'N',
  'equationSteps.hotkeys.chip.prev': 'P'
}
