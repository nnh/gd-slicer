import { splitString } from './split-string'
import { copyFile } from './docs-utils'
import Document = GoogleAppsScript.Document

function splitChild(element: Document.Element, open: boolean): [boolean, boolean] {
  const elementType = element.getType()
  console.log(elementType)
  switch (elementType) {
    case DocumentApp.ElementType.TEXT: {
      const [text, isOpen] = splitString(element.asText().getText(), open)
      console.log(element.asText().getText(), open, text, isOpen)
      if (text === '') {
        return [isOpen, true]
      } else {
        element.asText().setText(text)
        return [isOpen, false]
      }
    }
    case DocumentApp.ElementType.TABLE:
      if (open) {
        let isOpen = true
        for (let r = 0; r < element.asTable().getNumRows(); ++r) {
          const row = element.asTable().getRow(r)
          for (let c = 0; c < row.getNumCells(); ++c) {
            const cell = row.getCell(c)
            isOpen = splitChildren(cell, isOpen)
          }
        }
        return [isOpen, false]
      } else {
        return [false, true]
      }
    case DocumentApp.ElementType.LIST_ITEM: {
      open = splitChildren(element.asListItem(), open)
      return [open, false]
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      open = splitChildren(element.asParagraph(), open)
      return [open, false]
    }
    default:
      if (open) {
        return [true, false]
      } else {
        return [false, true]
      }
  }
}

function splitChildren(parent: Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem, open: boolean): boolean {
  for (let i = 0; i < parent.getNumChildren(); ++i) {
    const child = parent.getChild(i)
    const [isOpen, remove] = splitChild(child, open)
    open = isOpen
    console.log({ i, child, open, isOpen, remove })
    if (remove) {
      parent.removeChild(child)
      i--;
    }
  }
  return open
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
