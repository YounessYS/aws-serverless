const AWS = require("aws-sdk");
const pino = require("pino")({});

AWS.config.update({ region: "eu-west-2" });

const logger = pino;

module.exports.sqsToSNS = async (event) => {
  // Logging that we're calling the function
  logger.info("Function called");
  try {
    const body = JSON.parse(event.Records[0].body);
    logger.info({ body }, "Body parsed");

    const sns = new AWS.SNS();

    const messageParams = {
      Message: body.message,
      PhoneNumber: body.phoneNumber,
    };
    // Logging the constructed message params
    logger.info({ messageParams }, "Message params created");

    // Publishing the message to SNS
    await sns.publish(messageParams).promise();
    // Logging that the message has been sent to SNS
    logger.info("Message sent to SNS");

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message sent to SNS",
      }),
    };
  } catch (error) {
    // Logging that we've failed to send a message to SNS
    logger.error({ error }, "Error sending message to SNS");
    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error sending message to SNS",
        error: error.message,
      }),
    };
  }
};
