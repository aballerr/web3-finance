import {
  updateAllUserSafes,
  importAllSafeTransactions,
} from "../src/utils/gnosis";

const handler = async (event: any) => {
  try {
    if (event.Records) {
      for (const record of event.Records) {
        console.log(record.messageAttributes);
        console.log(record.messageAttributes.companyId.stringValue);
        await importAllSafeTransactions(
          parseInt(record.messageAttributes.companyId.stringValue)
        );
      }
    } else {
      const results = await updateAllUserSafes();
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "updated all" }),
    };
    return response;
  } catch (err) {
    console.log(err);

    const response = {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "failed to update" }),
    };
    return response;
  }
};

export { handler };
