import { TextSmNormal } from "components/Text";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { BeatLoader } from "react-spinners";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { formatNumber, formatPercentage, formatToDollar } from "utils";
import { authGet } from "utils/fetch-wrapper";

import { ActiveShape, COLORS, GraphHeader, GraphLegend } from "../common";

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

const renderActiveShape = (props: ActiveShape) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;
  const amount = formatNumber(parseFloat(payload.valEth));

  return (
    <g>
      <text x={cx} y={cy - 13} dy={8} textAnchor="middle" fill="#475467">
        {amount} {payload.symbol}
      </text>
      <text x={cx} y={cy + 13} dy={8} textAnchor="middle" fill="#101828">
        {formatToDollar(payload.value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const renderLegend = (props: GraphLegend) => {
  const { payload } = props;

  return (
    <ul>
      {payload.map((entry) => (
        <div
          className="flex items-center gap-8px mb-4px"
          key={entry.payload.name}
        >
          <span
            className="w-8px h-8px rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>
          <TextSmNormal
            className={
              entry.color === "#D0D5DD" ? "text-gray-400" : "text-gray-900"
            }
          >
            {formatPercentage(entry.payload.percent)} {entry.payload.name}
          </TextSmNormal>
        </div>
      ))}
    </ul>
  );
};

const CryptoByAsset = ({ graphPosition }: { graphPosition: string }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [assets, setAssets] = useState<Array<Asset>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateAssetsNew = () => {
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
    // updateAssets();
    updateAssetsNew();
  }, []);

  const finalAssets = useMemo(() => {
    return assets.map((asset, index) => ({
      value: asset.fiatBalance,
      valEth: ethers.utils.formatUnits(asset.balance, asset.decimals),
      name: asset.name,
      symbol: asset.symbol,
      color:
        activeIndex === -1 || index === activeIndex
          ? COLORS[index % COLORS.length]
          : "#D0D5DD",
    }));
  }, [assets, activeIndex]);

  const innerRadius = useMemo(() => {
    const maxLength = Math.max(
      ...assets.map((asset) => {
        console.log(asset);
        return `${asset.fiatBalance.toFixed(3)} ${asset.symbol}`.length;
      })
    );

    if (maxLength < 18) return 70;
    else if (maxLength < 20) return 80;
    else return 90;
  }, [assets]);

  return (
    <div>
      <GraphHeader
        graphPosition={graphPosition}
        title="CRYPTO BY ASSET"
        refreshGraph={updateAssetsNew}
        amount={assets.length}
      />
      <div
        style={{ width: 440, height: 310 }}
        className="mr-auto ml-auto mt-0px"
      >
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={440} height={310}>
              <Legend
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconSize={8}
                // @ts-ignore
                content={renderLegend}
              />
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={finalAssets}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                // @ts-ignore
                onMouseEnter={(props, _) => setActiveIndex(_)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                {finalAssets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CryptoByAsset;
