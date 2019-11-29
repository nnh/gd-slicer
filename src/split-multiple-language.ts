import { copyFile, reverseChildren } from './docs-utils'
import { getMaximumLanguageIndex, FixedLanguagedString, splitLanguageSentences } from './ml-splitter'
import Document = GoogleAppsScript.Document

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
  })
  return maximumLanguageIndex
}

function filterLanguage(body: Document.Body, targetIndex: number) {
  let deleting = false
  let index = 0
  reverseChildren(body, (element) => {    
    const elementType = element.getType()
    console.log({func: 'reverseChildrenCallback', elementType})
    let indexChanged = false
    if (elementType === DocumentApp.ElementType.TEXT) {
      const oldText = element.asText().getText()
      const newText = splitLanguageSentences(oldText).reverse().map(ls => {
        if (ls.languageIndex !== undefined) {
          index = ls.languageIndex
          indexChanged = true
        }
        return { str: ls.str, fixedLanguageIndex: index } as FixedLanguagedString
      }).filter(ls => ls.fixedLanguageIndex === targetIndex || ls.fixedLanguageIndex === 1).map(ls => ls.str).join('')
      element.asText().setText(newText)
      deleting = index !== targetIndex && index !== 1 && newText.length === 0
      console.log({deleting, oldText, newText, index })
    }
    return index != targetIndex && !indexChanged
  }, (child, parent) => {
    console.log({func: 'eachElementCallback', deleting, getType: child.getType()})
    if (deleting && child.getType() !== DocumentApp.ElementType.PARAGRAPH) {
      console.log('DELETING!')
      parent.removeChild(child)
    }
  })
}

function splitMultipleLanguageById(documentId: string) {
  const doc = DocumentApp.openById(documentId)
  const maximumLanguageIndex = getMaximumLanguageIndexFromBody(doc.getBody())
  console.log({maximumLanguageIndex})
  const name = doc.getName()
  for (let i = 2; i < maximumLanguageIndex + 1; ++i) {
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
