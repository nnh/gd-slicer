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
  let deleting = false
  reverseChildren(body, (element, parent) => {
    const elementType = element.getType()
    let indexChanged = false
    let oldText: string | undefined = undefined
    if (elementType === DocumentApp.ElementType.TEXT) {
      oldText = element.asText().getText()
      const {newIndex, newIndexChanged, newText} = getNewText(index, indexChanged, oldText, targetIndex)
      index = newIndex
      indexChanged = newIndexChanged
      if (oldText !== newText) {
        element.asText().setText(newText)
      }
      deleting = index !== targetIndex && index !== 1 && newText.length === 0
      if (deleting) {
        parent.removeChild(element)
      }
    }
    if (elementType == DocumentApp.ElementType.TEXT) {
      console.log({deleting, elementType: elementType.toString(), oldText, text: element.asText().getText()})
    } else {
      console.log({deleting, elementType: elementType.toString()})
    }

    return deleting
  }, (element, results) => {
    if (deleting && results.indexOf(false) === -1) {
      // 最後の操作が削除 かつ 子供を全部削除したら自身も殺してtrue を返す
      console.log({results})
      element.removeFromParent()
      return true
    } else {
      return false
    }
  })
}

function splitMultipleLanguageByLanguageIndex(copiedId: string, i: number) {
  const copiedDoc = DocumentApp.openById(copiedId)
  filterLanguage(copiedDoc.getBody(), i)
  copiedDoc.saveAndClose()
}

function splitMultipleLanguageById(documentId: string) {
  const doc = DocumentApp.openById(documentId)
  const maximumLanguageIndex = getMaximumLanguageIndexFromBody(doc.getBody())
  for (let i = 2; i < maximumLanguageIndex + 1; ++i) {
    const name = doc.getName()
    const copiedName = name + '_' + i.toString()
    const copiedId = copyFile(doc.getId(), copiedName)
    splitMultipleLanguageByLanguageIndex(copiedId, i)
  }
}

function test() {
  const documentId = "1NJyFVZ-T0aVHJ9Vxy9LLbQQo0nVYpOyboSa6B3K4BCc"
  const doc = DocumentApp.openById(documentId)
  const name = doc.getName()
  const i = 2
  const copiedName = name + '_' + i.toString()
  const copiedId = copyFile(doc.getId(), copiedName)
  splitMultipleLanguageByLanguageIndex(copiedId, i)
}

function splitMultipleLanguage() {
  splitMultipleLanguageById(DocumentApp.getActiveDocument().getId())
}
