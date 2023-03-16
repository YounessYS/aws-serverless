const { sendMessage } = require("../sqs.js");
const AWSMock = require("aws-sdk-mock");

describe("sendMessage", () => {
  afterEach(() => {
    AWSMock.restore();
  });

  test("should return success message when SQS message is sent", async () => {
    const sqsData = {
      MessageId: "12345",
    };

    const queueURL =
      "https://sqs.eu-west-2.amazonaws.com/533322355632/sqsQueueOne";

    AWSMock.mock("SQS", "sendMessage", (params, callback) => {
      callback(null, sqsData);
    });

    const result = await sendMessage(
      {
        body: {
          message: "Hello World",
          phoneNumber: "+447123456789",
        },
        path: "/send-message",
      },
      queueURL
    );

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: `Message sent to queue ${queueURL} with ID 12345`,
        sqsData,
      })
    );
  });

  test("should return error message when SQS message fails to send", async () => {
    const errorMessage = "Something went wrong";
    const queueURL =
      "https://sqs.eu-west-2.amazonaws.com/533322355632/sqsQueueOne";
    AWSMock.mock("SQS", "sendMessage", (params, callback) => {
      callback(new Error(errorMessage), null);
    });

    const result = await sendMessage(
      {
        body: {
          message: "Hello World",
          phoneNumber: "+447123456789",
        },
        path: "/send-message",
      },
      queueURL
    );

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({
        message: `Error sending message to SQS queue ${queueURL}: ${errorMessage}`,
      })
    );
  });
});
