import type { commonEn } from '../en/common'

/** Czech */
export const commonCs: Record<keyof typeof commonEn, string> = {
  'lang.en': 'EN',
  'lang.cs': 'CS',
  'lang.switch': 'Jazyk',
  'help.about': 'O {title}',
  'help.menu': 'Nápověda',
  'author.by': 'autor Štěpán Krouský',
  'author.title': 'Štěpán Krouský - portfolio',
  'transfer.export': 'Export',
  'transfer.import': 'Import',
  'transfer.exportTitle': 'Stáhnout desku jako JSON (pro odpovídající solver)',
  'transfer.importTitle': 'Načíst desku z JSON souboru',
  'transfer.exported': 'Deska exportována',
  'transfer.imported': 'Deska importována',
  'transfer.exportFailed': 'Desku se nepodařilo exportovat',
  'transfer.importFailed': 'Soubor se nepodařilo importovat',
  'transfer.wrongFamily': 'Špatný typ hádanky pro tuto aplikaci'
}
