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

    // Read values from form
    var templateInput = document.getElementById('templateName');
    var templateName = templateInput ? templateInput.value : '';

    // Helper for Journey Event binding
    function ev(field) {
      return '{{Event.' + activity.metaData.apiJourneyEntryName + '.' + field + '}}';
    }

    activity.arguments.execute.inArguments = [
      {
        data: {
          template_name: templateName,

          template_values: {
            subscriberKey: ev('subscriberKey'),
            confirmationCode: ev('confirmationCode'),
            appointmentDateTime: ev('appointmentDateTime')
          },

          message: {
            recipients: [
              ev('email')
            ],
            headers: {
              subject: ev('emailSubject'),
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
