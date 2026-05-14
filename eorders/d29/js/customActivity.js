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

    // Read values from form (modal)
    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subject');

    var templateName = templateInput ? templateInput.value : '';
    var subject = subjectInput ? subjectInput.value : '';

    // Helper for Journey Event binding
    function ev(field) {
      return '{{Event.' + activity.metaData.apiJourneyEntryName + '.' + field + '}}';
    }

    activity.arguments.execute.inArguments = [
      {
        data: {
          template_name: templateName,

          template_values: JSON.stringify({
            subscriberKey: ev('subscriberKey'),
            confirmationCode: ev('confirmationCode'),
            guestId: ev('guestId'),
            prsProfileId: ev('prsProfileId'),
            firstName: ev('firstName'),
            email: ev('email'),
            phoneNumber: ev('phoneNumber'),
            address_1: ev('address_1'),
            address_2: ev('address_2'),
            city: ev('city'),
            zip: ev('zip'),
            state: ev('state'),
            emailPreregisterUrl: ev('emailPreregisterUrl'),
            smsPreregisterUrl: ev('smsPreregisterUrl'),
            appointmentStatus: ev('appointmentStatus'),
            appointmentType: ev('appointmentType'),
            appointmentDateTime: ev('appointmentDateTime'),
            appointmentTimeZone: ev('appointmentTimeZone'),
            
            apptDeepLink: ev('apptDeepLink'),
            paymentOOP: ev('paymentOOP'),
            qrCode: ev('qrCode'),
            reasonForVisit: ev('reasonForVisit'),
            siteCode: ev('siteCode'),
            partnerName: ev('partnerName'),
            eorderAppointment: ev('eorderAppointment'),
            confirmAppointmentURL: ev('confirmAppointmentURL'),
           
            outstandingBalance: ev('outstandingBalance'),
            calendarLink: ev('calendarLink'),
            
            apptDeepLinkForModify: ev('apptDeepLinkForModify'),
            apptDeepLinkForCancel: ev('apptDeepLinkForCancel'),
                       
            orderDate: ev('orderDate'),
            landmarks: ev('landmarks'),
            pscClosureReason: ev('pscClosureReason')
          }),

          message: {
            recipients: [
              ev('email')
            ],
            headers: {
              subject: subject,
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
