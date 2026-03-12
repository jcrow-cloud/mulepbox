(function () {
  var connection = new Postmonger.Session();
  var payload = {};

  // Fixed list of DE fields (as provided)
  var FIELDS = [
    "subscriberKey","guestId","prsProfileId","firstName","email","phoneNumber",
    "emailPrereregisterUrl","smsPrereregisterUrl","state","confirmationCode",
    "appointmentStatus","appointmentType","appointmentDateTime","appointmentTimeZone",
    "appointmentSMSOptin","address_1","address_2","city","zip","apptDeepLink",
    "paymentOOP","qrCode","reasonForVisit","siteCode","partnerName","eorderAppointment",
    "confirmAppointmentURL","appointmentConfirmedFlag","outstandingBalance",
    "calendarLink","appointmentEmailOptin","apptDeepLinkForModify",
    "apptDeepLinkForCancel","isApprovedDomain"
  ];

  // When activity loads, populate UI if already configured
  connection.on("initActivity", function (data) {
    payload = data || {};
    try {
      var args = payload.arguments.execute.inArguments[0] || {};
      if (args.templateId) document.getElementById("templateId").value = args.templateId;
      if (args.deName) document.getElementById("deName").value = args.deName;
      if (args.subjectLine) document.getElementById("subjectLine").value = args.subjectLine;
    } catch (e) {}
  });

  document.getElementById("btnSave").addEventListener("click", onSave);

  function onSave() {
    var templateId = (document.getElementById("templateId").value || "").trim();
    var deName = (document.getElementById("deName").value || "").trim();
    var subjectLine = (document.getElementById("subjectLine").value || "").trim();

    if (!templateId) return alert("Template ID is required.");
    if (!deName) return alert("DE Name is required.");
    if (!subjectLine) return alert("Subject Line is required.");

    // Build inArguments object
    var inArgs = {
      templateId: templateId,
      deName: deName,
      subjectLine: subjectLine
    };

    // Inject all DE field tokens dynamically
    FIELDS.forEach(function (field) {
      inArgs[field] = "{{Contact.Attribute." + deName + "." + field + "}}";
    });

    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.arguments.execute.inArguments = [inArgs];

    // Save back to Journey Builder
    connection.trigger("updateActivity", payload);
  }
})();