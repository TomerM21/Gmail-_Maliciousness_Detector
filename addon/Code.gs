
function buildAddOn(e) {//google delivers e-event when email is opened(in our case)
 var card = CardService.newCardBuilder();
  
 

  var section = CardService.newCardSection();

  // button generating
  var action = CardService.newAction().setFunctionName('triggerAnalysis');
  var button = CardService.newTextButton()
      .setText("check the mail in my current window")
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED).setBackgroundColor("#915ee0");;
   
  
  section.addWidget(button);
  card.addSection(section);
  return card.build();

}

/**
 *  function that makes the HTTP request to the backend.
 */
function triggerAnalysis(e) {
  var messageId = e.gmail.messageId;
  var accessToken = e.gmail.accessToken;
  
  // getting the mail info
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var message = GmailApp.getMessageById(messageId);
  var sender = message.getFrom();
  var body = message.getPlainBody(); 
  
//here paste your server url
  var backendUrl = "https://crawling-violet-stuck.ngrok-free.dev/analyze"; 
  
  var payload = {
    "message_id": messageId,
    "sender": sender,
    "body": body
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    //info request from the python server in order to get the json
    var response = UrlFetchApp.fetch(backendUrl, options);
    var data = JSON.parse(response.getContentText());
    
   
    return createResultCard(data);
  } catch (err) {
    return CardService.newCardBuilder()
        .setHeader(CardService.newCardHeader().setTitle("Error"))
        .addSection(CardService.newCardSection()
            .addWidget(CardService.newTextParagraph().setText("Could not connect to backend: " + err)))
        .build();
  }
}

function createResultCard(data) {
  var card = CardService.newCardBuilder();
  var ltr = "\u202d"; 
  var pop = "\u202c";
  var malscore = data.total_score
  
  var statusMessage = "";
  var headerIconUrl = "";

  if (malscore < 30) {
    statusMessage = "Great weather conditions-go surfing upwind 🏄";
    headerIconUrl = "https://fonts.gstatic.com/s/e/notoemoji/latest/1f3c4/512.png";
  } else if (malscore >= 30 && malscore <= 60) {
    statusMessage = "Big waves ahead-check the conditions again 🌊";
    headerIconUrl = "https://fonts.gstatic.com/s/e/notoemoji/latest/1f30a/512.png";
  } else {
    statusMessage = "High risk. be careful!!! ⚠️";
    headerIconUrl = "https://fonts.gstatic.com/s/e/notoemoji/latest/26a0/512.png";
  }

  card.setHeader(CardService.newCardHeader()
    .setTitle(ltr + statusMessage + pop)
    .setImageUrl(headerIconUrl));

  var scoreSection = CardService.newCardSection();
  scoreSection.addWidget(CardService.newTextParagraph()
    .setText(ltr + "<br><b><font color=\"#202124\">MALICIOUSNESS SCORE: </font></b>" + 
             "<b><font color=\"#d93025\">" + malscore + "%</font></b>" + pop));
  
  card.addSection(scoreSection);

  // building the other sections
   function buildSection(title, analysis, iconUrl) {
    var section = CardService.newCardSection().setHeader(ltr + title + pop);
    
    var pointsText = (analysis && Array.isArray(analysis.points)) ? analysis.points.join("\n") : ltr + "No details available." + pop;
    var rawRank = (analysis && analysis.rank !== undefined) ? analysis.rank : "N/A";
    
    var formattedText = ltr + "<b>RISK SCORE: " + rawRank + "/100</b>" + pop + "\n" + pointsText;
    
    section.addWidget(CardService.newDecoratedText()
      .setText(formattedText)
      .setWrapText(true)
      .setStartIcon(CardService.newIconImage().setIconUrl(iconUrl)));
      
    return section;
  }

  // הוספת ניתוח המרכיבים
  card.addSection(buildSection("1. Mail Sender Analysis", data.sender_analysis, "https://www.gstatic.com/images/icons/material/system/1x/person_black_24dp.png"));
  card.addSection(buildSection("2. Content Analysis", data.content_analysis, "https://www.gstatic.com/images/icons/material/system/1x/description_black_24dp.png"));
  card.addSection(buildSection("3. Links Analysis", data.links_analysis, "https://www.gstatic.com/images/icons/material/system/1x/link_black_24dp.png"));
  card.addSection(buildSection("4. Attachments Analysis", data.files_analysis, "https://www.gstatic.com/images/icons/material/system/1x/attachment_black_24dp.png"));

  return card.build();
}
