import AssetImage from "components/AssetImage";
import { Column, VerticallyCentered } from "components/Common";
import { TextSmMedium, TextSmNormal, TextXsSmall } from "components/Text";
import { ethers } from "ethers";
import { getTokenLogoURI } from "hooks/useTokenLogo";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { authGet } from "utils/fetch-wrapper";

import { GraphHeader } from "../common";

interface Asset {
  id: number;
  tokenId: string;
  gnosisSafeId: number;
  companyId: number;
  balance: string;
  ethValue: null;
  timestamp: null;
  fiatBalance: number;
  fiatConversion: string;
  fiatCode: string;
  network: string;
  chainId: number;
  decimals: number;
  isTotalBalance: true;
  createdAt: Date;
  updatedAt: Date;
  symbol: string;
  name: string;
  assetPlatformId: string;
  ethereumAddress: null;
  polygonAddress: null;
  arbitrumAddress: null;
  optimimismAddress: null;
  assetSrcImage: string;
  isNative: boolean;
}

const CryptoHoldings = ({ graphPosition }: { graphPosition: string }) => {
  const [assets, setAssets] = useState<Array<Asset>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateAssets = () => {
    setIsLoading(true);
    authGet({ url: "graphs/safe-balances/new" })
      .then((res) => {
        if (res.balances) {
          setAssets(res.balances);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    updateAssets();
  }, []);

  return (
    <>
      <GraphHeader
        graphPosition={graphPosition}
        title="CRYPTO HOLDINGS"
        refreshGraph={updateAssets}
        amount={assets.length}
        disableExportToPng
      />
      {isLoading ? (
        <BeatLoader
          className="absolute"
          style={{
            width: 150,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          color="#a3e9cd"
          size={35}
        />
      ) : (
        <div id="crypto-holdings">
          <div>
            {assets.map((asset) => {
              const tokenUri = getTokenLogoURI(
                asset.polygonAddress || asset.ethereumAddress,
                asset.chainId
              );
              const value = ethers.utils.formatUnits(
                asset.balance,
                asset.decimals
              );

              const tokenName = asset.isNative
                ? asset.chainId === 137
                  ? "Polygon"
                  : "Ether"
                : asset.name;

              return (
                <div
                  key={tokenName}
                  className="flex justify-between border-b-1px border-gray-100 py-8px"
                >
                  <div className="flex">
                    <VerticallyCentered>
                      {tokenUri && (
                        <AssetImage
                          src={tokenUri}
                          alt="token"
                          backup={asset.assetSrcImage}
                        />
                      )}
                    </VerticallyCentered>

                    <Column className="ml-16px">
                      <TextSmNormal>{tokenName}</TextSmNormal>
                      <TextXsSmall className="text-gray-400">
                        {`${parseFloat(value).toFixed(3)} ${asset.symbol}`}
                      </TextXsSmall>
                    </Column>
                  </div>

                  <VerticallyCentered>
                    $
                    <TextSmMedium className="text-gray-900">
                      {asset.fiatBalance.toFixed(2)}
                    </TextSmMedium>
                  </VerticallyCentered>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default CryptoHoldings;
