/* global Postmonger */

var connection = new Postmonger.Session();

var payload = {};
var entryKey = null;
var emailFieldKey = 'email';
var schemaReady = false;

/**
 * Journey Builder handshake
 * --------------------------
 * IMPORTANT:
 * requestSchema() MUST be called only AFTER initActivity fires.
 * Calling it earlier causes Journey Builder to silently ignore the request.
 */
connection.on('initActivity', function (data) {
  payload = data || {};
  connection.trigger('requestSchema');
});

/**
 * Receive entry source schema
 */
connection.on('requestedSchema', function (schema) {
  if (!Array.isArray(schema) || !schema.length) {
    return;
  }

  // Extract entryKey (APIEvent-xxxx)
  var match = schema[0].key.match(/^Event\.([^\.]+)\./);
  entryKey = match ? match[1] : null;

  // Try to auto-detect email field
  var emailCol = schema.find(function (col) {
    return /(^|\.)email$/i.test(col.key);
  });

  if (emailCol) {
    emailFieldKey = emailCol.key.split('.').pop();
  }

  schemaReady = true;
  console.log('Schema loaded. entryKey =', entryKey);
});

/**
 * Handle Done / Save
 */
connection.on('clickedNext', function () {
  var templateName = getValue('templateName');
  var subject = getValue('subject');

  if (!templateName || !subject) {
    alert('Template Name and Subject are required.');
    return;
  }

  if (!schemaReady || !entryKey) {
    alert(
      'Journey entry data is not available yet. ' +
      'Make sure the journey has an entry source, save it, then reopen this activity.'
    );
    return;
  }

  var fromEmail = 'noreply@pcomm.questdiagnostics.com';

  var fields = [
    'subscriberKey',
    'confirmationCode',
    'guestId',
    'prsProfileId',
    'firstName',
    'email',
    'phoneNumber',
    'address_1',
    'address_2',
    'city',
    'zip',
    'state',
    'appointmentStatus',
    'appointmentType',
    'appointmentDateTime',
    'reasonForVisit',
    'siteCode',
    'partnerName'
  ];

  var templateValues = {};
  fields.forEach(function (field) {
    templateValues[field] = '{{Event.' + entryKey + '.' + field + '}}';
  });

  var body = {
    data: {
      template_name: templateName,
      template_values: JSON.stringify(templateValues), // escaped JSON string
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
});

/**
 * Tell Journey Builder we're ready
 */
connection.trigger('ready');

/**
 * Helpers
 */
function getValue(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
