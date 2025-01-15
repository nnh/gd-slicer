import "./code";
import "./docs-utils";
import "./ml-splitter";
import "./split-language";
import "./split-multiple-language";
import "./split-string";
import "./string-utils";
import { check } from "./code";
import { splitLanguage } from "./split-language";
import { splitMultipleLanguage } from "./split-multiple-language";
export function onOpen(e: GoogleAppsScript.Events.DocsOnOpen) {
    const menu = DocumentApp.getUi().createAddonMenu()
    if (e && e.authMode == ScriptApp.AuthMode.NONE) {
      // Add a normal menu item (works in all authorization modes).
      menu.addItem('日英分割', 'splitLanguage');
      menu.addItem('複数言語分割', 'splitMultipleLanguage')
      menu.addItem('全角記号の利用をチェック', 'check');
    } else {
      // Add a menu item based on properties (doesn't work in AuthMode.NONE).
      var properties = PropertiesService.getDocumentProperties();
      var workflowStarted = properties.getProperty('workflowStarted');
      if (workflowStarted) {
        menu.addItem('Check workflow status', 'checkWorkflow');
      } else {
        menu.addItem('日英分割', 'splitLanguage');
        menu.addItem('複数言語分割', 'splitMultipleLanguage')
        menu.addItem('全角記号の利用をチェック', 'check');
      }
    }
    menu.addToUi();
}
  
declare const global: {
  [x: string]: any;
};
global.onOpen = onOpen;
global.check = check;
global.splitLanguage = splitLanguage;
global.splitMultipleLanguage = splitMultipleLanguage;
