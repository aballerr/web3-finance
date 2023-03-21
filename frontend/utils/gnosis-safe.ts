export const safe = "safe";

// https://github.com/safe-global/safe-core-sdk/issues/128
//   const safeOwner = provider.getSigner(0);
//   const ethAdapter = new EthersAdapter({
//     ethers,
//     signer: safeOwner,
//   });

//   const safeFactory = await SafeFactory.create({
//     ethAdapter,
//     safeVersion: "1.3.0",
//   });
//   const owners = ["0x9Ff4436b0429862318f9C825b9170147F5FAb2f6"];

//   const threshold = 1;
//   const safeAccountConfig: SafeAccountConfig = {
//     owners,
//     threshold,
//   };

//   try {
//     console.log("creating safe..");
//     const safeSdk: Safe = await safeFactory.deploySafe({
//       safeAccountConfig,
//     });

//     console.log(safeSdk);
//     console.log("success");

//     const address = safeSdk.getAddress();
//     console.log(address);
//   } catch (err) {
//     console.log(err);
//     console.log("failed to create safe");
//   }
