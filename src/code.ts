function onOpen(e: GoogleAppsScript.Events.DocsOnOpen) {
  const menu = DocumentApp.getUi().createAddonMenu()
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Add a normal menu item (works in all authorization modes).
    menu.addItem('日英分割(β)', 'splitLanguage');
    menu.addItem('複数言語分割(β)', 'splitMultipleLanguage')
    menu.addItem('全角記号の利用をチェック(β)', 'check');
  } else {
    // Add a menu item based on properties (doesn't work in AuthMode.NONE).
    var properties = PropertiesService.getDocumentProperties();
    var workflowStarted = properties.getProperty('workflowStarted');
    if (workflowStarted) {
      menu.addItem('Check workflow status', 'checkWorkflow');
    } else {
      menu.addItem('日英分割(β)', 'splitLanguage');
      menu.addItem('複数言語分割(β)', 'splitMultipleLanguage')
      menu.addItem('全角記号の利用をチェック(β)', 'check');
    }
  }
  menu.addToUi();
}

function check() {
  var body = DocumentApp.getActiveDocument().getBody();
  var text = body.editAsText();

  var string = text.getText();
  var stringArray = string.split('');
  var reg = /[\u0080–\u00FF\u0370–\u03FF\u0400–\u04FF\u2000–\u206F\u2100–\u214F\u2190–\u21FF\u2200–\u22FF\u2300–\u23FF\u2500–\u257F\u25A0–\u25FF\u2600–\u26FF\uFF00-\uFFEF\u818F]/;
  for (var i = 0; i < stringArray.length; i++) {
    if (reg.test(stringArray[i])) {
    //if (/[｀～！＠＃＄％＾＆＊（）＿＋＝￥｛｝［］｜；：，_･／＜＞？Ａ-Ｚａ-ｚ０-９]/.test(stringArray[i])) {
      text.setBackgroundColor(i, i, '#00FFFF');
    }
  }
}
