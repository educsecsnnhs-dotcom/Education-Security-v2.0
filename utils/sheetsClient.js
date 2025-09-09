// utils/sheetsClient.js
const { google } = require("googleapis");

function getAuthClient() {
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

async function getSheetValues(sheetId, range) {
  const client = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  return res.data.values;
}

async function updateSheetValues(sheetId, range, values) {
  const client = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

module.exports = { getSheetValues, updateSheetValues };
