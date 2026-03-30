/* global Postmonger */

var connection = new Postmonger.Session();

var payload = {};
var entryKey = null;
var emailFieldKey = 'email';
var schemaReady = false;

/**
 * Journey Builder handshake
 * --------------------------
 * requestSchema() MUST be called only AFTER initActivity fires.
 */
connection.on('initActivity', function (data) {
  payload = data || {};
  connection.trigger('requestSchema');
});

/**
 * Receive entry source schema
 */
connection.on('requestedSchema', function (schema) {
  console.log('requestedSchema payload:', schema);

  if (!Array.isArray(schema) || !schema.length) {
    return;
  }

  // Extract entryKey (APIEvent-xxxx)
  var firstKey = schema[0] && schema[0].key;
  if (!firstKey) {
    console.warn('First schema item has no key:', schema[0]);
    return;
  }

  var match = firstKey.match(/^Event\.([^\.]+)\./);
  entryKey = match ? match[1] : null;

  // IE-safe email field detection (NO Array.prototype.find)
  var emailCol = null;
  for (var i = 0; i < schema.length; i++) {
    if (
      schema[i] &&
      schema[i].key &&
      /(^|\.)email$/i.test(schema[i].key)
    ) {
      emailCol = schema[i];
      break;
    }
  }

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
  for (var j = 0; j < fields.length; j++) {
    templateValues[fields[j]] =
      '{{Event.' + entryKey + '.' + fields[j] + '}}';
  }

  var body = {
    data: {
      template_name: templateName,
      template_values: JSON.stringify(templateValues), // escaped JSON
      message: {
        recipients: [
          '{{Event.' + entryKey + '.' + emailFieldKey + '}}'
        ],
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
