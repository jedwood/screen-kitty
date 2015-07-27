/*
THIS SCRIPT SHOULD BE MADE AS A GOOGLE APPS SCRIPT AND PUBLISHED FOR ANONYMOUS ACCESS.
*/

//////////////////////////////////////////////////////    TRIGGERS AND STUFF

function setMeUp(e) {
  displayAPIEndpoint();
}

function displayAPIEndpoint() {
  var scriptProperties = PropertiesService.getScriptProperties();
//  scriptProperties.setProperty('ssid', SpreadsheetApp.getActiveSpreadsheet().getId());
  var ep = ScriptApp.getService().getUrl();
  Browser.msgBox("Your API Endpoint: " + ep);
}

function timeCheck() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var isPlaying = scriptProperties.getProperty("isPlaying");
  if (isPlaying == true || isPlaying == "true") {
    var tl = scriptProperties.getProperty("timeLeft");
    tl -= 1;
    scriptProperties.setProperty("timeLeft", tl);
    pingPubNub(tl);
    if (tl == 0) {
      timerControl("stop");
    }
  }

}

function resetTimer() {
  timerControl('reset');
}

function timerControl(action) {
  var scriptProperties = PropertiesService.getScriptProperties();
  if (action == "reset") {
    scriptProperties.setProperty("timeLeft", 60);
    scriptProperties.setProperty("isPlaying", false);
  } else if (action == "start") {
    scriptProperties.setProperty("isPlaying", true);
    weaved('on');
  } else if (action == "stop") {
    scriptProperties.setProperty("isPlaying", false);
    weaved('off');
  }
}
//////////////////////////////////////////////////////    RESTful API STUFF

function doGet(req) {

  var scriptProperties = PropertiesService.getScriptProperties();
  var returnData = {success: true};  // optimism FTW

  if (req.parameter._method && req.parameter._method.toLowerCase() == "post") return lePost(req);

  if (req.parameter.action == "start") {
    if (parseInt(scriptProperties.getProperty("timeLeft"), 10) > 0) {
      timerControl('start');
    } else {
      returnData.timeOut = true;
    }

  } else if (req.parameter.action == "stop") {
    timerControl('stop');
  } else if (req.parameter.action == "time") {
    returnData.timeLeft = scriptProperties.getProperty("timeLeft");
    returnData.isPlaying = scriptProperties.getProperty("isPlaying");
  }

  return sendResponse(req, returnData)
}


//////////////////////////////////////////////////////    HELPERS

function weaved(state) {
  var url = 'WEAVED-URL-HERE';
  var options =
   {
     'method' : 'post'
   }
  var endpoint;
  if (state == 'off') {
    endpoint = 'devOff.sh';
  } else {
    endpoint = 'devOn.sh';
  }
  try {
    UrlFetchApp.fetch(url + endpoint, options);
  } catch(e){
    //ignore
  }
}

function pingPubNub(msg) {
  var PUB_KEY = 'YOUR-KEY-HERE';
  var SUB_KEY = 'YOUR-KEY-HERE';
  var CHANNEL = 'screen_limit';

  var url = 'http://pubsub.pubnub.com/publish/' + PUB_KEY + '/' + SUB_KEY + '/0/' + CHANNEL + '/0/' + escape('"' + msg + '"');
  var response = UrlFetchApp.fetch(url);
}

/**
* send off the final response
* @param {req} the HTTP request object
* @param {returnData} the object to send
*
*/
function sendResponse(req, returnData) {
  //if you want a quick send-to-email kind of debugging:
  //GmailApp.sendEmail('jed@limechile.com', "DEBUG", JSON.stringify(req.parameter));
  if (req.parameter.callback) { //JSONP
    return ContentService.createTextOutput(req.parameter.callback + '(' + JSON.stringify(returnData) + ')' ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(returnData)).setMimeType(ContentService.MimeType.JSON);
  }
}