/*
 * KODEK MEDIA — Google Apps Script for Form Submissions
 *
 * REFERENCE FILE — This is NOT loaded by the website.
 * Paste this code into each Google Sheet via Extensions > Apps Script,
 * then deploy as a web app (Execute as: Me, Access: Anyone).
 *
 * The website's form-handler.js will POST form data here,
 * and this script appends it as a new row in the active sheet
 * and sends an email notification.
 */

function doPost(e) {
  var NOTIFY_EMAIL = 'info@kodekmedia.com';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
  var data = JSON.parse(e.postData.contents);

  // Sanitize values so Sheets doesn't interpret them as formulas
  function safe(val) {
    if (typeof val !== 'string') return val;
    if (/^[+=\-@]/.test(val)) return "'" + val;
    return val;
  }

  // On first submission, create header row from the field names
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(Object.keys(data));
  }

  // Match values to existing headers (so column order stays consistent)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function(header) {
    return data[header] !== undefined ? safe(data[header]) : '';
  });

  // Add any new fields not yet in headers
  var newFields = Object.keys(data).filter(function(key) {
    return headers.indexOf(key) === -1;
  });
  newFields.forEach(function(key) {
    headers.push(key);
    row.push(safe(data[key]));
    sheet.getRange(1, headers.length).setValue(key);
  });

  sheet.appendRow(row);

  // Send email notification
  var name = (data.firstName || '') + ' ' + (data.lastName || '');
  var email = data.email || 'N/A';
  var body = 'New submission to ' + sheetName + ':\n\n';
  Object.keys(data).forEach(function(key) {
    if (key !== 'timestamp') {
      body += key + ': ' + data[key] + '\n';
    }
  });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New Kodek Media Application — ' + name.trim(),
    body: body
  });

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
