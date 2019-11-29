import { copyFile, reverseChildren } from './docs-utils'
import { getMaximumLanguageIndex, FixedLanguagedString, splitLanguageSentences } from './ml-splitter'
import Document = GoogleAppsScript.Document
import { matches } from './string-utils'

function getMaximumLanguageIndexFromBody(body: Document.Body): number {
  let maximumLanguageIndex = 0
  reverseChildren(body, (element) => {
    const elementType = element.getType()
    if (elementType === DocumentApp.ElementType.TEXT) {
      const index = getMaximumLanguageIndex(element.asText().getText())
      if (index !== undefined) {
        maximumLanguageIndex = Math.max(maximumLanguageIndex, index)
      }
    }
    return false
  })
  return maximumLanguageIndex
}

function filterLanguage(body: Document.Body, targetIndex: number) {
  let index = 0
  reverseChildren(body, (element) => {
    const elementType = element.getType()
    let indexChanged = false
    if (elementType === DocumentApp.ElementType.TEXT) {
      const oldText = element.asText().getText()
      const newText = splitLanguageSentences(oldText).reverse().map(ls => {
        if (ls.languageIndex !== undefined) {
          index = ls.languageIndex
          indexChanged = true
        }
        return [index, ls.str] as FixedLanguagedString
      }).filter(ls => ls[0] === targetIndex).join('')
      element.asText().setText(newText)
    }
    return index != targetIndex && !indexChanged
  })
}

function splitMultipleLanguageById(documentId: string) {
  const doc = DocumentApp.openById(documentId)
  const maximumLanguageIndex = getMaximumLanguageIndexFromBody(doc.getBody())
  console.log({maximumLanguageIndex})
  const name = doc.getName()
  for (let i = 0; i < maximumLanguageIndex + 1; ++i) {
    const copiedName = name + '_' + i.toString()
    const copiedId = copyFile(documentId, copiedName)
    const copiedDoc = DocumentApp.openById(copiedId)
    filterLanguage(copiedDoc.getBody(), i)
    copiedDoc.saveAndClose()
  }
}


function test() {
  const documentId = "1GYO4JgdVfXLsMQqmM-ngqxyvp0K8MfTe2gX4wq7ngBQ"
  splitMultipleLanguageById(documentId)
}

function splitMultipleLanguage() {
  splitMultipleLanguageById(DocumentApp.getActiveDocument().getId())
}
