/* global Postmonger */
(function () {
  'use strict';

  // Create Postmonger session
  var connection = new Postmonger.Session();

  // Activity payload
  var activity = {};

  document.addEventListener('DOMContentLoaded', function () {
    // Lifecycle handlers
    connection.on('initActivity', onInitActivity);
    connection.on('clickedNext', onDone);

    // Tell Journey Builder we are ready
    connection.trigger('ready');
  });

  /**
   * Initialize / rehydrate activity
   */
  function onInitActivity(payload) {
    activity = payload || {};
  }

  /**
   * Handle Done / Save
   */
  function onDone() {
    // Ensure arguments object exists
    activity.arguments = activity.arguments || {};

    /**
     * VERY IMPORTANT:
     * For validation safety, execute body MUST be static and simple.
     * No schema, no tokens, no dynamic JSON.
     */
    activity.arguments.execute = {
      format: 'json',
      body: "{}"
    };

    // Mark activity as configured
    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    // Hand control back to Journey Builder
    connection.trigger('updateActivity', activity);
  }

})();
