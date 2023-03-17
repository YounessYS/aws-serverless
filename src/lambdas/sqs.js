const AWS = require("aws-sdk");
const pino = require("pino")();
const validatePhoneNumber = require("../utils/validatePhoneNumber");
const validateMessageBody = require("../utils/validateMessageBody");

AWS.config.update({ region: "eu-west-2" });

module.exports.sendMessage = async (event) => {
  console.log(JSON.stringify(event));
  const sqs = new AWS.SQS();

  const queueURL = process.env.SQS_QUEUE_URL;

  const { phoneNumber, messageBody } = JSON.parse(event.body);

  // Logging that we're sending a message to SQS
  pino.info(`Sending message to SQS queue ${queueURL}`);

  // Check the phone number is valid
  if (!validatePhoneNumber(phoneNumber)) {
    pino.error(`Invalid phone number: ${phoneNumber}`);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid phone number: ${phoneNumber}`,
      }),
    };
  }

  // Check the message doesnt exceed 1024 bytes
  if (!validateMessageBody(messageBody)) {
    pino.error(`Message exceeds 1024 bytes: ${messageBody}`);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Message exceeds 1024 bytes: ${messageBody}`,
      }),
    };
  }

  try {
    // Send message to SQS
    const sqsParams = {
      MessageBody: messageBody,
      QueueUrl: queueURL,
    };

    const sqsData = await sqs.sendMessage(sqsParams).promise();

    // Logging that we've sent a message to SQS
    pino.info(
      `Message sent to SQS queue ${queueURL} with ID ${sqsData.MessageId}`
    );

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Message sent to queue ${queueURL} with ID ${sqsData.MessageId}`,
        sqsData,
      }),
    };
  } catch (error) {
    // Logging that we've failed to send a message to SQS
    pino.error(error, `Error sending message to SQS queue ${queueURL}`);
    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error sending message to SQS ${queueURL}: ${error.message}`,
      }),
    };
  } finally {
    // Logging that we've finished sending a message to SQS
    pino.info(`Finished processing request for ${event.path}`);
  }
};
