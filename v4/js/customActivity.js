/* global Postmonger */
(function () {
  'use strict';

  // Create Postmonger session (bridge to Journey Builder)
  var connection = new Postmonger.Session();

  // Activity payload provided by Journey Builder
  var activity = {};
  var schema = [];

  /**
   * Wire Postmonger lifecycle events
   */
  document.addEventListener('DOMContentLoaded', function () {
    connection.on('initActivity', onInitActivity);
    connection.on('requestedSchema', onRequestedSchema);
    connection.on('clickedNext', onDone);

    // Signal readiness
    connection.trigger('ready');

    // Request Entry Source schema (widely used, though undocumented)
    connection.trigger('requestSchema');
  });

  /**
   * Initialize / rehydrate activity when editing
   */
  function onInitActivity (payload) {
    activity = payload || {};
  }

  /**
   * Receive Entry Source schema
   * Schema keys are used AS‑IS (no entryKey parsing)
   */
  function onRequestedSchema (payload) {
    console.log('requestedSchema payload:', payload);

    // Some tenants send array directly, others wrap it
    schema = payload && payload.schema ? payload.schema : payload;

    if (!Array.isArray(schema) || !schema.length) {
      return;
    }

    console.log('Schema received with', schema.length, 'fields');
  }

  /**
   * Handle clicking Done / Save
   */
  function onDone () {
    var templateName = getValue('templateName');
    var subject = getValue('subject');

    if (!templateName || !subject) {
      alert('Template Name and Subject are required.');
      return;
    }

    // Build template_values using schema keys verbatim
    var templateValues = {};
    for (var i = 0; i < schema.length; i++) {
      if (schema[i] && schema[i].key) {
        var fieldName = schema[i].key.split('.').pop();
        templateValues[fieldName] = '{{' + schema[i].key + '}}';
      }
    }

    var body = {
      data: {
        template_name: templateName,
        template_values: JSON.stringify(templateValues), // escaped JSON string
        message: {
          recipients: [], // Paubox will resolve recipient from template or Mule
          headers: {
            subject: subject,
            from: 'noreply@pcomm.questdiagnostics.com'
          },
          allowNonTLS: false,
          forceSecureNotification: false
        }
      }
    };

    // Attach execute payload
    activity.arguments = activity.arguments || {};
    activity.arguments.execute = {
      format: 'json',
      body: JSON.stringify(body)
    };

    // Mark activity configured
    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    // Hand control back to Journey Builder
    connection.trigger('updateActivity', activity);
  }

  /**
   * Helper to get trimmed input value
   */
  function getValue (id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

})();
