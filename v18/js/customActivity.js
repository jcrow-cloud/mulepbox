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

    var data =
      activity.arguments &&
      activity.arguments.execute &&
      activity.arguments.execute.inArguments &&
      activity.arguments.execute.inArguments[0] &&
      activity.arguments.execute.inArguments[0].data
        ? activity.arguments.execute.inArguments[0].data
        : {};

    var entryInput = document.getElementById('apiJourneyEntryName');
    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subject');

    if (entryInput) entryInput.value = activity.metaData && activity.metaData.apiJourneyEntryName ? activity.metaData.apiJourneyEntryName : '';
    if (templateInput) templateInput.value = data.template_name || '';
    if (subjectInput && data.message && data.message.headers) subjectInput.value = data.message.headers.subject || '';
  }

  function onDone() {
    activity.arguments = activity.arguments || {};
    activity.arguments.execute = activity.arguments.execute || {};

    var entryInput = document.getElementById('apiJourneyEntryName');
    var templateInput = document.getElementById('templateName');
    var subjectInput = document.getElementById('subject');

    var entryKey = entryInput ? entryInput.value : '';
    var templateName = templateInput ? templateInput.value : '';
    var subject = subjectInput ? subjectInput.value : '';

    function ev(field) {
      return '{{Event.' + entryKey + '.' + field + '}}';
    }

    var templateValues = {
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
      emailPrereregisterUrl: ev('emailPrereregisterUrl'),
      smsPrereregisterUrl: ev('smsPrereregisterUrl'),
      appointmentStatus: ev('appointmentStatus'),
      appointmentType: ev('appointmentType'),
      appointmentDateTime: ev('appointmentDateTime'),
      appointmentTimeZone: ev('appointmentTimeZone'),
      appointmentSMSOptin: ev('appointmentSMSOptin'),
      apptDeepLink: ev('apptDeepLink'),
      paymentOOP: ev('paymentOOP'),
      qrCode: ev('qrCode'),
      reasonForVisit: ev('reasonForVisit'),
      siteCode: ev('siteCode'),
      partnerName: ev('partnerName'),
      eorderAppointment: ev('eorderAppointment'),
      confirmAppointmentURL: ev('confirmAppointmentURL'),
      appointmentConfirmedFlag: ev('appointmentConfirmedFlag'),
      outstandingBalance: ev('outstandingBalance'),
      calendarLink: ev('calendarLink'),
      appointmentEmailOptin: ev('appointmentEmailOptin'),
      apptDeepLinkForModify: ev('apptDeepLinkForModify'),
      apptDeepLinkForCancel: ev('apptDeepLinkForCancel'),
      inactiveTokens: ev('inactiveTokens'),
      reactivatedTokens: ev('reactivatedTokens'),
      isApprovedDomain: ev('isApprovedDomain'),
      dateAdded: ev('dateAdded')
    };

    activity.arguments.execute.inArguments = [
      {
        data: {
          template_name: templateName,
          template_values: JSON.stringify(templateValues),
          message: {
            recipients: [ev('email')],
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
    activity.metaData.apiJourneyEntryName = entryKey;

    connection.trigger('updateActivity', activity);
  }

})();
