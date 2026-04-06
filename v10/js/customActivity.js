/* global Postmonger */
(function () {
  'use strict';

  var connection = new Postmonger.Session();
  var activity = {};
  var schema = [];

  document.addEventListener('DOMContentLoaded', function () {
    connection.on('initActivity', onInitActivity);
    connection.on('requestedSchema', onRequestedSchema);
    connection.on('clickedNext', onDone);

    connection.trigger('ready');
    connection.trigger('requestSchema');
  });

  // ------------------------------------------------------------
  // Init: rehydrate UI from saved Journey configuration
  // ------------------------------------------------------------
  function onInitActivity(payload) {
    activity = payload || {};

    var args =
      activity.arguments &&
      activity.arguments.execute &&
      activity.arguments.execute.inArguments &&
      activity.arguments.execute.inArguments[0]
        ? activity.arguments.execute.inArguments[0]
        : {};

    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subjectLine');

    if (templateInput) {
      templateInput.value = args.templateName || '';
    }

    if (subjectInput) {
      subjectInput.value = args.subjectLine || '';
    }
  }

  // ------------------------------------------------------------
  // Schema: store Entry Source schema for merge field generation
  // ------------------------------------------------------------
  function onRequestedSchema(payload) {
    schema = payload && payload.schema ? payload.schema : [];
  }

  // ------------------------------------------------------------
  // Done: persist configuration + runtime payload definition
  // ------------------------------------------------------------
  function onDone() {
    activity.arguments = activity.arguments || {};
    activity.arguments.execute = activity.arguments.execute || {};

    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subjectLine');

    var templateName = templateInput ? templateInput.value : '';
    var subjectLine = subjectInput ? subjectInput.value : '';

    // ------------------------------------------
    // Build merge-field map from Entry Source
    // ------------------------------------------
    var fields = {};

    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        if (schema[i] && schema[i].key) {
          var simpleName = schema[i].key.split('.').pop();
          fields[simpleName] = '{{' + schema[i].key + '}}';
        }
      }
    }

    // ------------------------------------------
    // Canonical JB persistence (CONFIG)
    // ------------------------------------------
    activity.arguments.execute.inArguments = [
      {
        templateName: templateName,
        subjectLine: subjectLine
      }
    ];

    // ------------------------------------------
    // Runtime payload (what JB POSTs on EXECUTE)
    // ------------------------------------------
    activity.arguments.execute.format = 'json';
    activity.arguments.execute.body = JSON.stringify({
      data: {
        templateName: templateName,
        subjectLine: subjectLine,
        fields: fields
      }
    });

    activity.arguments.execute.outArguments = [
      { status: 'DefaultStatus' }
    ];

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

})();
