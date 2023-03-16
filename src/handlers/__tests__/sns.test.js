const { sqsToSNS } = require("../sns.js");

describe("sqsToSNS", () => {
  test("should return a successful response when message is sent to SNS", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            message: "Hello World",
            phoneNumber: "+447123456789",
          }),
        },
      ],
    };

    const result = await sqsToSNS(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("Message sent to SNS");
  });

  test("should return an error response when message fails to send to SNS", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            message: "Hello World",
            phoneNumber: "+447123456789",
          }),
        },
      ],
    };

    // Set an invalid SNS_TOPIC_ARN to simulate an error
    process.env.SNS_TOPIC_ARN = "";

    const result = await sqsToSNS(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain("Error sending message to SNS");
  });
});
