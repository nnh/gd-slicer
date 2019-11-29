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
  if (str.length === 0) {
    return []
  } else {
    const mm = matches(RegExp('([^|]+)(\\|+)?','g'), str)
    return mm.map(m => ({str: m[1], languageIndex: m[2] !== undefined ? m[2].length : undefined}))
  }  
}

export function getMaximumLanguageIndex(str: string): LanguageIndex {
  if (str.length === 0) {
    return undefined
  } else {
    const ls = splitLanguageSentences(str).reverse()
    let maximumIndex: LanguageIndex = undefined
    ls.forEach(ls => {
      if (ls.languageIndex !== undefined) {
        maximumIndex = Math.max(ls.languageIndex, maximumIndex == undefined ? 0 : maximumIndex)
      }
    })
    return maximumIndex
  }
}
