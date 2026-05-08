
function buildAddOn(e) {//google delivers e-event when email is opened(in our case)
  var messageId = e.gmail.messageId;
  
  var card = CardService.newCardBuilder()//card=leftobject in gmail-Ui. we want to deliver data to the ui
    .setHeader(CardService.newCardHeader()
      .setTitle("Analysis Pending")
      .setSubtitle("Ready to scan message: " + messageId)
      .setImageUrl("https://www.gstatic.com/images/icons/material/system/2x/policy_black_24dp.png"))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText("Click the button below to send this email to the security backend for evaluation.")))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setText("Analyze Email")
        .setOnClickAction(CardService.newAction().setFunctionName("triggerAnalysis"))));// when uset triggers we start the function

  return card.build();
}

/**
 * This will be the function that makes the HTTP request to your backend.
 */
function triggerAnalysis(e) {
 var messageId = e.gmail.messageId;
  
  // פלייסבולדר - כאן נכניס את כתובת ה-ngrok רגע לפני ההרצה
  var backendUrl = "https://YOUR_NGROK_URL_HERE.ngrok-free.app/analyze"; 
  
  var payload = { "message_id": messageId };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true // עוזר לראות שגיאות אם השרת נופל
  };
  
  try {
    var response = UrlFetchApp.fetch(backendUrl, options);
    var result = JSON.parse(response.getContentText());
    
    // ציור כרטיס התוצאות ומעבר אליו
    var resultCard = buildResultCard(result);
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(resultCard))
      .build();
      
  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("Error: Could not reach backend."))
      .build();
  }
}

/**
 * 3. פונקציית התוצאה - בונה את המסך הסופי על בסיס הנתונים מהשרת
 */
function buildResultCard(result) {
  // בחירת צבע לפי פסק הדין
  var color = "#34A853"; // ירוק כברירת מחדל
  if (result.verdict === "Suspicious") color = "#FBBC04"; // צהוב
  if (result.verdict === "Malicious") color = "#EA4335"; // אדום
  
  var section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText("<b>Verdict:</b> <font color='" + color + "'>" + result.verdict + "</font>"))
    .addWidget(CardService.newTextParagraph()
      .setText("<b>Risk Score:</b> " + result.score + "/100"));
      
  if (result.reasoning && result.reasoning.length > 0) {
    var reasonsText = "<b>Reasoning:</b><br>";
    for (var i = 0; i < result.reasoning.length; i++) {
      reasonsText += "• " + result.reasoning[i] + "<br>";
    }
    section.addWidget(CardService.newTextParagraph().setText(reasonsText));
  }
  
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Analysis Complete")
      .setImageUrl("https://www.gstatic.com/images/icons/material/system/2x/check_circle_black_24dp.png"))
    .addSection(section);
    
  return card.build();
}