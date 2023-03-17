const phoneRegex = /^\+44\d{10}$/;

module.exports = function validatePhoneNumber(phoneNumber) {
  return phoneNumber && phoneRegex.test(phoneNumber);
};
