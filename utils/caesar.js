//utils/caesar.js

function encryptPassword(password) {
  const shift = parseInt(process.env.CIPHER_KEY) || 3;
  return password
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) + shift))
    .join("");
}

function decryptPassword(encrypted) {
  const shift = parseInt(process.env.CIPHER_KEY) || 3;
  return encrypted
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) - shift))
    .join("");
}

/**
 * Compare plain password against encrypted one
 * @param {string} plain - user input
 * @param {string} encrypted - stored encrypted password
 * @returns {boolean}
 */
function comparePassword(plain, encrypted) {
  return encryptPassword(plain) === encrypted;
}

module.exports = { encryptPassword, decryptPassword, comparePassword };
