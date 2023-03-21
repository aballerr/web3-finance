import { updateSafeBalances } from "../src/utils/gnosis";
import { getPreloadedClient } from "../src/utils/knex";

const handler = async (event: any) => {
  try {
    if (event.Records) {
      for (const record of event.Records) {
        await updateSafeBalances(
          parseInt(record.messageAttributes.companyId.stringValue)
        );
      }
    } else {
      const knex = await getPreloadedClient();
      const companies = await knex.COMPANY().where({});

      for (const company of companies) {
        await updateSafeBalances(company.id);
      }
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "updated all balances" }),
    };
    return response;
  } catch (err) {
    console.log(err);

    const response = {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "failed to update balances",
      }),
    };
    return response;
  }
};

export { handler };
