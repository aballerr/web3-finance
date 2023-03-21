import AWS from "aws-sdk";

export enum SQS_URLS {
  TRANSACTIONS_QUEUE = "https://sqs.us-east-1.amazonaws.com/214772664190/transactions-queue",
  BALANCE_QUEUES = "https://sqs.us-east-1.amazonaws.com/214772664190/balances-queue",
}

AWS.config.update({ region: "us-east-1" });

const sqs = new AWS.SQS({});

export const addMessageToQueue = async (companyId: number, url: SQS_URLS) => {
  const params = {
    // Remove DelaySeconds parameter and value for FIFO queues
    DelaySeconds: 10,
    MessageAttributes: {
      companyId: {
        DataType: "String",
        StringValue: `${companyId}`,
      },
    },
    MessageBody: "the new Message!!!",
    QueueUrl: url,
  };

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
};
