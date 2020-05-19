import { splitString } from './split-string'
import { copyFile } from './docs-utils'
import Document = GoogleAppsScript.Document

interface SplitResult {
  isOpen: boolean
  remove: boolean
}

function splitChild(element: Document.Element, open: boolean): SplitResult {
  const elementType = element.getType()
  switch (elementType) {
    case DocumentApp.ElementType.TEXT: {
      const previousText = element.asText().getText()
      const [text, isOpen] = splitString(previousText, open)
      //console.log({previousText, text})
      if (previousText !== '' && text === '') {
        return {isOpen, remove: true}
      } else {
        if (previousText !== text) {
          element.asText().setText(text)
        }
        return {isOpen, remove: false}
      }
    }
    case DocumentApp.ElementType.TABLE:
      //console.log('TABLE', {open})
      if (open) {
        let isOpen = true
        let remove = true
        for (let r = 0; r < element.asTable().getNumRows(); ++r) {
          const row = element.asTable().getRow(r)
          for (let c = 0; c < row.getNumCells(); ++c) {
            const cell = row.getCell(c)
            const res = splitChildren(cell, isOpen)
            isOpen = res.isOpen
            if (!res.remove) remove = false
          }
        }
        return {isOpen, remove}
      } else {
        return {isOpen: false, remove: true}
      }
    case DocumentApp.ElementType.LIST_ITEM: {
      //console.log('LIST_ITEM', {open})
      const {isOpen, remove} = splitChildren(element.asListItem(), open)
      return {isOpen, remove}
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      const res = splitChildren(element.asParagraph(), open)
      //console.log('PARAGRAPH', {open, res})
      return res
    }
    default:
      //console.log({elementType, open})
      if (open) {
        return {isOpen: true, remove: false}
      } else {
        return {isOpen: false, remove: true}
      }
  }
}

function splitChildren(parent: Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem, open: boolean): SplitResult {
  if (parent.getNumChildren() === 0) {
    //console.log("No children", {open})
    return {isOpen: open, remove: !open}
  } else {
  let remove = true
    for (let i = 0; i < parent.getNumChildren(); ++i) {
      const child = parent.getChild(i)
      const res = splitChild(child, open)
      open = res.isOpen
      if (res.remove) {
        // BODY の最終セクションは削除できない
        if (!(parent.getType() === DocumentApp.ElementType.BODY_SECTION && (i + 1 === parent.getNumChildren()))) {
          parent.removeChild(child)
          i--;
        }
      } else {
        remove = false
      }
    }
    return {isOpen: open, remove}
  }
}

function splitLanguage() {
  const doc = DocumentApp.getActiveDocument()
  const documentId = doc.getId()
  const name = doc.getName()
  {
    const jpId = copyFile(documentId, name + 'jp')
    const jpDoc = DocumentApp.openById(jpId)
    let open = true
    splitChildren(jpDoc.getBody(), open)
    jpDoc.saveAndClose()
  }
  {
    const enId = copyFile(documentId, name + 'en')
    const enDoc = DocumentApp.openById(enId)
    let open = false
    splitChildren(enDoc.getBody(), open)
    enDoc.saveAndClose()
  }
}
