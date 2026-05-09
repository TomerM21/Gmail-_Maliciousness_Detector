
function buildAddOn(e) {//google delivers e-event when email is opened(in our case)
 var card = CardService.newCardBuilder();
  
  // card.setHeader(CardService.newCardHeader()
  //   .setTitle("Phish Finder")
  //   .setSubtitle("Ready to analyze this email?"));

  var section = CardService.newCardSection();
  // section.addWidget(CardService.newTextParagraph()
  //   .setText("produce a maliciousness score"));

  // יצירת הכפתור שמפעיל את הניתוח האמיתי
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
 * This will be the function that makes the HTTP request to your backend.
 */
function triggerAnalysis(e) {
  var messageId = e.gmail.messageId;
  var accessToken = e.gmail.accessToken;
  
  // 1. הגדרת הרשאות ושליפת תוכן המייל האמיתי
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var message = GmailApp.getMessageById(messageId);
  var sender = message.getFrom();
  var body = message.getPlainBody(); 
  
  // 2. כתובת השרת שלך (אל תשכח לעדכן לכתובת ה-ngrok העדכנית!)
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
    // 3. שליחה ל-Python וקבלת ה-JSON מה-AI
    var response = UrlFetchApp.fetch(backendUrl, options);
    var data = JSON.parse(response.getContentText());
    
    // 4. יצירת כרטיס התוצאות
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

  // לוגיקה: ככל ש-total_score (מה-AI) גבוה יותר, המייל מסוכן יותר.
  // אם אתה רוצה ש-malscore ייצג את רמת הסיכון, פשוט תשתמש ב-data.total_score.
  var malscore = data.total_score
  
  var statusMessage = "";
  var headerIconUrl = "";

  // קביעת הודעה ואיקון לפי רמת הסיכון (0-100)
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

  // הגדרת ה-Header עם הסטטוס והאיקון
  card.setHeader(CardService.newCardHeader()
    .setTitle(ltr + statusMessage + pop)
    .setImageUrl(headerIconUrl));

  // --- סקציית הציון המוגדל (הפתרון להבלטה) ---
  var scoreSection = CardService.newCardSection();
  scoreSection.addWidget(CardService.newTextParagraph()
    .setText(ltr + "<br><b><font color=\"#202124\">MALICIOUSNESS SCORE: </font></b>" + 
             "<b><font color=\"#d93025\">" + malscore + "%</font></b>" + pop));
  
  card.addSection(scoreSection);

  // פונקציה לבניית שאר הסקציות (פירוט הניתוח)
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