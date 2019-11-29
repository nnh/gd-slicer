import Document = GoogleAppsScript.Document

export function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

export type ParentalElement = Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem
export type EachChildCallback = (element: Document.Element) => void
export type EachElementCallback = (child: Document.Element, parent: ParentalElement) => void

export function reverseChild(element: Document.Element,
                             parent: ParentalElement,
                             callback: EachChildCallback,
                             eachElementCallback?: EachElementCallback): void {
  if (eachElementCallback) {
    console.log({reverseChild: element.getType()})
  }
  const elementType = element.getType()
  switch (elementType) {
    case DocumentApp.ElementType.TABLE: {
      for (let r = element.asTable().getNumRows() - 1; 0 <= r; --r) {
        const row = element.asTable().getRow(r)
        for (let c = row.getNumCells() - 1; 0 <= c; --c) {
          const cell = row.getCell(c)
          reverseChildren(cell, callback, eachElementCallback)
        }
      }
      break;
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      reverseChildren(element.asParagraph(), callback, eachElementCallback)
      break;
    }
    case DocumentApp.ElementType.LIST_ITEM: {
      reverseChildren(element.asListItem(), callback, eachElementCallback)
      break;
    }
    default: {
      callback(element)
      break;
    }
  }
  if (eachElementCallback) {
    eachElementCallback(element, parent)
  }
}

export function reverseChildren(parent: ParentalElement, callback: EachChildCallback, eachElementCallback?: EachElementCallback) {
  for (let i = parent.getNumChildren() - 1; 0 <= i; --i) {
    const child = parent.getChild(i)
    reverseChild(child, parent, callback, eachElementCallback)
  }
}
