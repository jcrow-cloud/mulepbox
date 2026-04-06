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

  /**
   * Initialize activity
   */
  function onInitActivity(payload) {
    activity = payload || {};
  }

  /**
   * Receive entry source schema
   */
  function onRequestedSchema(payload) {
    schema = payload && payload.schema ? payload.schema : payload;
  }

  /**
   * Save configuration
   */
  function onDone() {
    activity.arguments = activity.arguments || {};

    /**
     * Build a realistic execute payload.
     * This mirrors how normal custom activities work,
     * without doing anything exotic that could break validation.
     */
    var executePayload = {
      data: {
        fields: {}
      }
    };

    // Include schema keys as placeholder tokens
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
      body: JSON.stringify(executePayload)
    };

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

})();
