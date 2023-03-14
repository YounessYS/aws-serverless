const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-2" });

const sendSQSMessage = async (event) => {
  const sqs = new AWS.SQS();

  const queueURL = process.env.QUEUE_URL;
  const params = {
    messageBody: JSON.stringify(event.body),
    QueueUrl: queueURL,
  };

  const data = await sqs.sendMessage(params).promise();

  console.log(`Message sent to queue ${queueURL} with ID ${data.MessageId}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Message sent to queue ${queueURL} with ID ${data.MessageId}`,
      data,
    }),
  };
};

module.exports = {
  handler: sendSQSMessage,
};
