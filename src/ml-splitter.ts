import { matches } from './string-utils'

// undefined: インデックス未確定
// number: インデックス確定済み
export type LanguageIndex = number | undefined
export type LanguagedString = [LanguageIndex, string]
export interface FixedLanguagedString {
  str: string
  fixedLanguageIndex: number
}
export interface LanguageSentence {
  str: string
  languageIndex: LanguageIndex
}

export function splitLanguageSentences(str: string): LanguageSentence[] {
  const mm = matches(/([^|]+$|([^|]*)(\|+))/g, str)
  return mm.map(m => {
    if (m[0].match(/\|$/)) {
      return ({str: m[2], languageIndex: m[3].length})
    } else {
      return ({str: m[0], languageIndex: undefined})
    }
  })
}

export function getMaximumLanguageIndex(str: string): LanguageIndex {
  const ls = splitLanguageSentences(str).reverse()
  let maximumIndex: LanguageIndex = undefined
  ls.forEach(ls => {
    if (ls.languageIndex !== undefined) {
      maximumIndex = Math.max(ls.languageIndex, maximumIndex == undefined ? 0 : maximumIndex)
    }
  })
  return maximumIndex
}

export function getNewText(index: number, indexChanged: boolean, oldText: string, targetIndex: number) {
  const newText = splitLanguageSentences(oldText).reverse().map(ls => {
    if (ls.languageIndex !== undefined) {
      index = ls.languageIndex
      indexChanged = true
    }
    return { str: ls.str, fixedLanguageIndex: index } as FixedLanguagedString
  }).filter(ls => ls.fixedLanguageIndex === targetIndex || ls.fixedLanguageIndex === 1).map(ls => ls.str).reverse().join('')
  return {newIndex: index, newIndexChanged: indexChanged, newText}
}
