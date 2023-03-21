import Bn from "bn.js";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { BeatLoader } from "react-spinners";
import { authGet } from "utils/fetch-wrapper";

import { GraphHeader } from "../common";

ChartJS.register(ArcElement, Tooltip, Legend);

const legendOptions = {
  position: "right" as const,
  labels: {
    usePointStyle: true,
    pointStyle: "circle",
    borderRadius: 1,
    boxHeight: 8,
    boxWidth: 8,
  },
};

const toolTioptions = {
  usePointStyle: true,
  padding: {
    right: 10,
    top: 10,
    bottom: 10,
  },
};

const callbacks = {
  labelPointStyle: function () {
    return {
      pointStyle: false,
      rotation: 0,
    } as const;
  },
  title: function () {
    return "";
  },
};

interface Token {
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

interface Asset {
  balance: string;
  ethValue: string;
  fiatBalance: string;
  fiatCode: string;
  fiatConversion: string;
  timestamp: string;
  token: null | Token;
  tokenAddress: null | string;
  native?: string;
}

interface AssetHolding {
  balance: string;
  decimals: number;
  balanceUSD: number;
  value: string;
  token: Token | null;
  isNative?: boolean;
  nativeSymbol?: string;
  chainId: number;
  tokenAddress: string | null;
  percentage?: string;
  label?: string;
}

interface AssetHoldingMap {
  [symbol: string]: AssetHolding;
}

let set = -1;

const originals = [
  "#8AE2C1",
  "#36BFFA",
  "#F670C7",
  "#FDB022",
  "#F97066",
  "#A48AFB",
  "#FAC515",
  "#F38744",
  "#FF692E",
  "#9B8AFB",
  "#8098F9",
  "#3CCB7F",
];

const CryptoByAsset = ({ graphPosition }: { graphPosition: string }) => {
  const [assets, setAssets] = useState<Array<AssetHolding>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<Array<string>>(originals);
  const [borderColors, setBorderColors] = useState<Array<string>>(
    originals.map(() => "white")
  );

  const updateAssets = () => {
    const totalAssets: AssetHoldingMap = {};
    setAssets([]);
    setIsLoading(true);

    authGet({ url: "graphs/safe-balances" }).then(
      ({
        allAssets,
      }: {
        success: boolean;
        allAssets: Array<{
          network: string;
          chainId: number;
          assets: Array<Asset>;
        }>;
      }) => {
        for (const { assets, network, chainId } of allAssets) {
          for (const asset of assets) {
            const nativeSymbol =
              asset.token === null
                ? network === "Polygon"
                  ? "MATIC"
                  : "ETH"
                : "";

            const key =
              asset.token === null ? nativeSymbol : asset.token.symbol;

            if (totalAssets[key]) {
              const oldBalance = totalAssets[key].balance;
              totalAssets[key].balance = new Bn(oldBalance)
                .add(new Bn(asset.balance))
                .toString();

              totalAssets[key].balanceUSD += parseFloat(asset.fiatBalance);
              totalAssets[key].value = ethers.utils.formatUnits(
                totalAssets[key].balance,
                totalAssets[key].decimals
              );
            } else {
              totalAssets[key] = {
                balance: asset.balance,
                token: asset.token,
                decimals: asset.token?.decimals || 18,
                balanceUSD: parseFloat(asset.fiatBalance),
                isNative: asset.token === null,
                nativeSymbol: nativeSymbol,
                chainId,
                tokenAddress: asset.tokenAddress,
                value: ethers.utils.formatUnits(
                  asset.balance,
                  asset.token?.decimals || 18
                ),
              };
            }
          }
        }

        const sorted = Object.values(totalAssets).sort(
          (a, b) => b.balanceUSD - a.balanceUSD
        );
        const total = sorted.reduce(
          (reducer, val) => reducer + val.balanceUSD,
          0
        );

        sorted.map((val) => {
          val.percentage = `${((val.balanceUSD / total) * 100).toFixed(0)}%`;

          return val;
        });

        setIsLoading(false);
        setAssets(sorted);
      }
    );
  };

  useEffect(() => {
    setIsLoading(true);
    updateAssets();
  }, []);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      // @ts-ignore
      onHover: function (context, element) {
        const elementIndex = element.length ? element[0].index : -1;
        if (element.length && set !== elementIndex) {
          const newColors = originals.map((c, index) =>
            index !== elementIndex ? "#D0D5DD" : c
          );
          const newBorderColors = originals.map((c, index) =>
            index !== elementIndex ? "white" : c
          );

          setColors(newColors);
          setBorderColors(newBorderColors);
          set = elementIndex;
        } else if (elementIndex === -1 && set !== -1) {
          setColors(originals);
          set = -1;
        }
      },
      plugins: {
        legend: { ...legendOptions },

        tooltip: {
          ...toolTioptions,
          callbacks: {
            ...callbacks,
            // @ts-ignore
            label: function (context) {
              const asset = assets[context.dataIndex];
              return `$${asset.balanceUSD.toFixed(2)}`;
            },
            // @ts-ignore
            afterLabel: function (context) {
              const asset = assets[context.dataIndex];
              return `${parseFloat(asset.value).toFixed(2)} ${
                asset.token?.symbol || asset.nativeSymbol
              }`;
            },
          },
        },
      },
    };
  }, [assets]);

  const data = useMemo(() => {
    return {
      labels: assets.map(
        (asset) =>
          `${asset.percentage} ${asset.token?.symbol || asset.nativeSymbol}`
      ),
      datasets: [
        {
          data: assets.map((asset) => asset.balanceUSD),
          borderWidth: 1,
          backgroundColor: colors,
          borderColor: borderColors,
        },
      ],
    };
  }, [assets, borderColors, colors]);

  return (
    <>
      <GraphHeader
        graphPosition={graphPosition}
        title="CRYPTO BY ASSET"
        refreshGraph={updateAssets}
        amount={assets.length}
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
            <Doughnut height={265} options={options} data={data} />
          </div>
        </div>
      )}
    </>
  );
};

export default CryptoByAsset;
