const { sendMessage } = require("../sqs.js");
const AWSMock = require("aws-sdk-mock");

describe("sendMessage", () => {
  const mockPhoneNumber = "+447123456789";
  const mockMessageBody = "Hello World";
  const mockQueueURL =
    "https://sqs.eu-west-2.amazonaws.com/123456789012/sms-queue";

  beforeEach(() => {
    // Mock the environment variable
    process.env.SQS_QUEUE_URL = mockQueueURL;
  });

  afterEach(() => {
    // Remove the envrionment variable
    delete process.env.SQS_QUEUE_URL;

    // Reset the AWS mock
    AWSMock.restore();
  });

  test("should send a message to SQS", async () => {
    // Mock the AWS.SQS.sendMessage method
    AWSMock.mock("SQS", "sendMessage", (params, callback) => {
      expect(params).toEqual({
        MessageBody: mockMessageBody,
        QueueUrl: mockQueueURL,
      });
      callback(null, { MessageId: "123" });
    });

    const event = {
      body: JSON.stringify({
        phoneNumber: mockPhoneNumber,
        messageBody: mockMessageBody,
      }),
      path: "/test",
    };

    const response = await sendMessage(event);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        message: `Message sent to queue ${mockQueueURL} with ID 123`,
        sqsData: { MessageId: "123" },
      })
    );
  });

  test("should return an error if phone number is invalid", async () => {
    const invalidPhoneNumber = "invalid";

    const event = {
      body: JSON.stringify({
        phoneNumber: invalidPhoneNumber,
        messageBody: mockMessageBody,
      }),
      path: "/test",
    };

    const response = await sendMessage(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        message: `Invalid phone number: ${invalidPhoneNumber}`,
      })
    );
  });

  test("should return an error if message body is too long", async () => {
    const longMessageBody = "a".repeat(1025);

    const event = {
      body: JSON.stringify({
        phoneNumber: mockPhoneNumber,
        messageBody: longMessageBody,
      }),
      path: "/test",
    };

    const response = await sendMessage(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      JSON.stringify({
        message: `Message exceeds 1024 bytes: ${longMessageBody}`,
      })
    );
  });

  test("should return an error if sendMessage fails", async () => {
    const errorMessage = "Error sending message to SQS";

    // Mock the AWS.SQS.sendMessage method to throw an error
    AWSMock.mock("SQS", "sendMessage", (params, callback) => {
      callback(new Error(errorMessage));
    });

    const event = {
      body: JSON.stringify({
        phoneNumber: mockPhoneNumber,
        messageBody: mockMessageBody,
      }),
      path: "/test",
    };

    const response = await sendMessage(event);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(
      JSON.stringify({
        message: `${errorMessage} ${mockQueueURL}: ${errorMessage}`,
      })
    );
  });
});
