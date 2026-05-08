/* global Postmonger */
(function () {
  'use strict';

  var connection = new Postmonger.Session();
  var activity = {};

  document.addEventListener('DOMContentLoaded', function () {
    connection.on('initActivity', onInitActivity);
    connection.on('clickedNext', onDone);

    connection.trigger('ready');
  });

  function onInitActivity(payload) {
    activity = payload || {};
  }

  function onDone() {
    activity.arguments = activity.arguments || {};
    activity.arguments.execute = activity.arguments.execute || {};

    activity.arguments.execute.inArguments = [
      {
        data: {
          template_name: 'SFMC_Appointments_payload',

          template_values: {
            subscriberKey: 'TEST_SUBSCRIBER_001'
          },

          message: {
            recipients: [
              'jeannette.crow@gmail.com'
            ],
            headers: {
              subject: 'TEST v25 – Paubox Custom Activity',
              from: 'noreply@pcomm.questdiagnostics.com'
            },
            allowNonTLS: false,
            forceSecureNotification: false
          }
        }
      }
    ];

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

})();
