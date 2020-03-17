import { copyFile, reverseChildren } from './docs-utils'
import { getMaximumLanguageIndex, getNewText } from './ml-splitter'
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
    return undefined
  }, () => {})
  return maximumLanguageIndex
}

function filterLanguage(body: Document.Body, targetIndex: number) {
  let index = 1
  reverseChildren(body, (element, parent) => {
    const elementType = element.getType()
    let indexChanged = false
    if (elementType === DocumentApp.ElementType.TEXT) {
      const oldText = element.asText().getText()
      const {newIndex, newIndexChanged, newText} = getNewText(index, indexChanged, oldText, targetIndex)
      index = newIndex
      indexChanged = newIndexChanged
      element.asText().setText(newText)
      if (index !== targetIndex && index !== 1 && newText.length === 0) {
        parent.removeChild(element)
        return true
      }
    }
    return false
  }, (element, results) => {
    if (results.indexOf(false) !== -1) {
      // 子供を全部削除したら自身も殺してtrue を返す
      element.removeFromParent()
      return true
    } else {
      return false
    }
  })
}

function splitMultipleLanguageById(documentId: string) {
  const doc = DocumentApp.openById(documentId)
  const maximumLanguageIndex = getMaximumLanguageIndexFromBody(doc.getBody())
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
  const documentId = "10Yiokp8UucMInZVl7e5n1ISTOEP69shA5u5vXBy7h3A"
  splitMultipleLanguageById(documentId)
}

function splitMultipleLanguage() {
  splitMultipleLanguageById(DocumentApp.getActiveDocument().getId())
}
