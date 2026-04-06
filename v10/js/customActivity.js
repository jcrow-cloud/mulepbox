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

  function onInitActivity(payload) {
    activity = payload || {};

    // Restore saved UI values
    if (activity.metaData) {
      var templateInput = document.getElementById('templateName');
      var subjectInput = document.getElementById('subjectLine');

      if (templateInput) {
        templateInput.value = activity.metaData.templateName || '';
      }

      if (subjectInput) {
        subjectInput.value = activity.metaData.subjectLine || '';
      }
    }
  }

  function onRequestedSchema(payload) {
    schema = payload && payload.schema ? payload.schema : payload;
  }

  function onDone() {
    activity.arguments = activity.arguments || {};
    activity.metaData = activity.metaData || {};

    // Read UI inputs
    var templateName = '';
    var subjectLine = '';

    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subjectLine');

    if (templateInput) {
      templateName = templateInput.value || '';
    }

    if (subjectInput) {
      subjectLine = subjectInput.value || '';
    }

    // Build execute payload
    var executePayload = {
      data: {
        fields: {},
        templateName: templateName,
        subjectLine: subjectLine
      }
    };

    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        if (schema[i] && schema[i].key) {
          var simpleName = schema[i].key.split('.').pop();
          executePayload.data.fields[simpleName] =
            '{{' + schema[i].key + '}}';
        }
      }
    }

    activity.arguments.execute = {
      format: 'json',
      body: JSON.stringify(executePayload),
      outArguments: [
        { status: 'DefaultStatus' }
      ]
    };

    // Persist UI state for re-open
    activity.metaData.templateName = templateName;
    activity.metaData.subjectLine = subjectLine;
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

})();
