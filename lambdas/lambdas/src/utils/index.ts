import AWS from "aws-sdk";

// Create a Secrets Manager client
const client = new AWS.SecretsManager({
  region: "us-east-1",
});

export enum StoreSecrets {
  GOOGLE = "google",
  POSTGRES = "postgresdb",
  JWT = "jwt",
  COINGECKO = "coingecko",
}

export interface SecretValues {
  [key: string]: string;
}

const getSecret = async (secretName: StoreSecrets) => {
  return new Promise((res, rej) => {
    client.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        rej(err);
      } else {
        // Decrypts secret using the associated KMS key.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if (data?.SecretString) {
          return res(JSON.parse(data.SecretString));
        } else {
          // @ts-ignore
          const buff = new Buffer(data.SecretBinary, "base64");
          const decodedBinarySecret = buff.toString("ascii");

          console.log(decodedBinarySecret);

          return res(decodedBinarySecret);
        }
      }

      console.log("end run");
      console.log(data);

      return res(data);
    });
  });
};

export default getSecret;
