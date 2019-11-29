import { matches } from './string-utils'

// undefined: インデックス未確定
// number: インデックス確定済み
export type LanguageIndex = number | undefined
export type LanguagedString = [LanguageIndex, string]
export type FixedLanguagedString = [number, string]

export function getMaximumLanguageIndex(str: string): LanguageIndex {
  if (str.length === 0) {
    return undefined
  } else {
    const mm = matches(RegExp('([^|]+)(\\|+)?','g'), str)
    let maximumIndex = 0
    mm.reverse().forEach(m => {
      if (m[2] !== undefined) {
        maximumIndex = Math.max(m[2].length, maximumIndex)
      }
    })
    return maximumIndex
  }
}
