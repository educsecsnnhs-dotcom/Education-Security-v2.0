// utils/sheetsClient.js
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Path to your service account key (JSON file from Google Cloud Console)
const KEYFILEPATH = path.join(__dirname, "../config/credentials.json");

// Scopes required for Sheets API
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Load credentials
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Create Sheets client
const sheets = google.sheets({ version: "v4", auth });

// ============================
// Fetch sheet values
// ============================
async function getSheetValues(sheetId, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return res.data.values || [];
}

// ============================
// Update sheet values
// ============================
async function updateSheetValues(sheetId, range, values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED", // allows formulas
    resource: { values },
  });
  return true;
}

// ============================
// Create new Google Sheet
// ============================
async function createSheet(title = "New Record Book") {
  const res = await sheets.spreadsheets.create({
    resource: {
      properties: { title },
      sheets: [{ properties: { title: "Sheet1" } }],
    },
  });
  return res.data.spreadsheetId;
}

module.exports = {
  getSheetValues,
  updateSheetValues,
  createSheet,
};
