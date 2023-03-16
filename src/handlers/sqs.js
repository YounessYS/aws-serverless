const AWS = require("aws-sdk");
const pino = require("pino")();

AWS.config.update({ region: "eu-west-2" });

module.exports.sendMessage = async (event, queueURL) => {
  const sqs = new AWS.SQS();

  // Logging that we're sending a message to SQS
  pino.info(`Sending message to SQS queue ${queueURL}`);

  const messageBody = JSON.stringify(event.body);

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
        message: `Error sending message to SQS queue ${queueURL}: ${error.message}`,
      }),
    };
  } finally {
    // Logging that we've finished sending a message to SQS
    pino.info(`Finished processing request for ${event.path}`);
  }
};
