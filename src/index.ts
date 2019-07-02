import splitString from './split-string'
import Document = GoogleAppsScript.Document

function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

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

function main() {
  const documentId = "1qw_Cl8_DqQAAmXSE-1aZTVGY2XkvCfnE5qr9Mo4eEf4"
  {
    const jpId = copyFile(documentId, 'jp')
    const jpDoc = DocumentApp.openById(jpId)
    let open = true
    splitChildren(jpDoc.getBody(), open)
    jpDoc.saveAndClose()
  }
  {
    const enId = copyFile(documentId, 'en')
    const enDoc = DocumentApp.openById(enId)
    let open = false
    splitChildren(enDoc.getBody(), open)
    enDoc.saveAndClose()
  }
}
