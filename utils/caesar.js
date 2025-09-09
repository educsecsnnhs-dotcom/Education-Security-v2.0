// utils/caesar.js
function encryptPassword(password) {
  const shift = parseInt(process.env.CIPHER_KEY) || 3;
  return password
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + shift);
    })
    .join("");
}

function decryptPassword(encrypted) {
  const shift = parseInt(process.env.CIPHER_KEY) || 3;
  return encrypted
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - shift);
    })
    .join("");
}

module.exports = { encryptPassword, decryptPassword };
