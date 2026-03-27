
/* global Postmonger */

var connection = new Postmonger.Session();
var payload = {};
var entryKey = null;
var emailFieldKey = 'email';

connection.on('initActivity', onInit);
connection.on('requestedSchema', onSchema);
connection.on('clickedNext', onDone);

connection.trigger('ready');
connection.trigger('requestSchema');

function onInit(data) {
  payload = data || {};
}

function onSchema(schema) {
  if (!Array.isArray(schema) || !schema.length) return;
  var match = schema[0].key.match(/^Event\.([^\.]+)\./);
  entryKey = match ? match[1] : null;

  var emailCol = schema.find(function (c) {
    return /(^|\.)email$/i.test(c.key);
  });

  if (emailCol) {
    emailFieldKey = emailCol.key.split('.').pop();
  }
}

function onDone() {
  var templateName = getVal('templateName');
  var subject = getVal('subject');

  if (!entryKey || !templateName || !subject) {
    alert('Template Name and Subject are required.');
    return;
  }

  var fromEmail = 'noreply@pcomm.questdiagnostics.com';

  var fields = [
    'subscriberKey','confirmationCode','guestId','prsProfileId','firstName','email',
    'phoneNumber','address_1','address_2','city','zip','state',
    'appointmentStatus','appointmentType','appointmentDateTime',
    'reasonForVisit','siteCode','partnerName'
  ];

  var templateValues = {};
  fields.forEach(function (f) {
    templateValues[f] = '{{Event.' + entryKey + '.' + f + '}}';
  });

  var body = {
    data: {
      template_name: templateName,
      template_values: JSON.stringify(templateValues),
      message: {
        recipients: ['{{Event.' + entryKey + '.' + emailFieldKey + '}}'],
        headers: {
          subject: subject,
          from: fromEmail
        },
        allowNonTLS: false,
        forceSecureNotification: false
      }
    }
  };

  payload.arguments = payload.arguments || {};
  payload.arguments.execute = {
    format: 'json',
    body: JSON.stringify(body)
  };

  payload.metaData = payload.metaData || {};
  payload.metaData.isConfigured = true;

  connection.trigger('updateActivity', payload);
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
