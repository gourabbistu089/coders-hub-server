// import { SendEmailCommand } from "@aws-sdk/client-ses";
// import { sesClient } from "./libs/sesClient.js";

const {SendEmailCommand} = require("@aws-sdk/client-ses");
const {sesClient} = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
    return new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: `<h1>${body}</h1>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: "This is a text-only version of the email.",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
  };
  
  const run = async (subject, body, toAddress) => {
    const sendEmailCommand = createSendEmailCommand(
    //   "recipient@example.com",
    //   "sender@example.com",
    toAddress,
    // "gourabbistu@codershub.run.place",
    "gourabbistu@gmail.com",
      subject,
      body
    );
  
    try {
      return await sesClient.send(sendEmailCommand);
    } catch (caught) {
      if (caught instanceof Error && caught.name === "MessageRejected") {
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      throw caught;
    }
  };
  
  // snippet-end:[ses.JavaScript.email.sendEmailV3]
  module.exports =  { run };