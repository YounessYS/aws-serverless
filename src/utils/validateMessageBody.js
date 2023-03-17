module.exports = function validateMessageBody(messageBody) {
  return messageBody && Buffer.byteLength(messageBody, "utf8") <= 1024;
};
