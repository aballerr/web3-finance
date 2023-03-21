import {
  getFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  getSignMessageLibDeployment,
  SingletonDeployment,
} from "@gnosis.pm/safe-deployments";
import { ChainInfo } from "@gnosis.pm/safe-react-gateway-sdk";
import { EMPTY_DATA, ZERO_ADDRESS } from "constants/data";
import semverSatisfies from "semver/functions/satisfies";
import { SafeOwner } from "types";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

import { getChainById } from "./chain";

const LATEST_SAFE_VERSION =
  process.env.REACT_APP_LATEST_SAFE_VERSION || "1.3.0";
export type ChainId = ChainInfo["chainId"];

export const getProxyFactoryContractInstance = (chainId: ChainId = "137") => {
  // @ts-ignore
  const web3 = new Web3(window.ethereum);
  const proxyFactoryDeployment =
    getProxyFactoryDeployment({
      version: LATEST_SAFE_VERSION,
      network: chainId.toString(),
    }) ||
    getProxyFactoryDeployment({
      version: LATEST_SAFE_VERSION,
    });
  const contractAddress = proxyFactoryDeployment?.networkAddresses[chainId];

  if (!contractAddress) {
    throw new Error(
      `GnosisSafeProxyFactory contract not found for chainId: ${chainId}`
    );
  }

  return new web3.eth.Contract(
    proxyFactoryDeployment?.abi as AbiItem[],
    contractAddress
  ) as unknown;
};

export const getSafeContractDeployment = ({
  safeVersion = "1.3.0",
}: {
  safeVersion: string;
}): SingletonDeployment | undefined => {
  // We have to check if network is L2
  const chainId = "137";
  //   const chainConfig = getChainById(networkId);

  // We had L1 contracts in three L2 networks, xDai, EWC and Volta so even if network is L2 we have to check that safe version is after v1.3.0
  //   const useL2ContractVersion =
  //     chainConfig.l2 && semverSatisfies(safeVersion, ">=1.3.0");

  //   const getDeployment = useL2ContractVersion
  //     ? getSafeL2SingletonDeployment
  //     : getSafeSingletonDeployment;

  return getSafeSingletonDeployment({
    version: safeVersion,
    network: chainId.toString(),
  });
};

// safeAddress
export const getSafeCreationInstance = () => {
  const safe = getSafeContractDeployment({ safeVersion: "1.3.0" });
  // @ts-ignore
  const web3 = new Web3(window.ethereum);
  const safeInstance = new web3.eth.Contract(safe?.abi as AbiItem[]);

  return safeInstance;
};

export const createPolygonSafes = ({
  from,
  owners,
}: {
  from: string;
  owners: Array<SafeOwner>;
}) => {
  const proxyFactoryMaster = getProxyFactoryContractInstance();
  const instance = getSafeCreationInstance();

  const safeAccounts = owners.map((owner) => owner.address);
  const numConfirmations = 2;
  const fallbackAddress = from;

  const safeCreationSalt = Date.now();
  const gnosisSafeData = instance.methods
    .setup(
      safeAccounts,
      numConfirmations,
      ZERO_ADDRESS,
      EMPTY_DATA,
      fallbackAddress,
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS
    )
    .encodeABI();

  // @ts-ignore
  const deploymentTx = proxyFactoryMaster.methods.createProxyWithNonce(
    "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
    gnosisSafeData,
    safeCreationSalt
  );

  const sendParams = {
    from: from,
    to: "0xa6b71e26c5e0845f74c812102ca7114b6a896ab2",
    value: "0x0",
    maxFeePerGas: "85000000000",
    maxPriorityFeePerGas: "40000000000",
    gasLimit: "300000",
  };

  return deploymentTx
    .send(sendParams)
    .once("transactionHash", (txHash: string) => {
      console.log(txHash);
    })
    .then((txReceipt: string) => {
      console.log("Original tx mined:", txReceipt);

      // @ts-ignore
      return Promise.resolve(txReceipt.events[0].address);
    });
};
