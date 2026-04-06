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
  }

  function onRequestedSchema(payload) {
    schema = payload && payload.schema ? payload.schema : payload;
  }

  function onDone() {
    activity.arguments = activity.arguments || {};

    var executePayload = {
      data: {
        fields: {}
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

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

})();
