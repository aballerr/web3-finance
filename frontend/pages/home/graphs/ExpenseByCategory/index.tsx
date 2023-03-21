import { VerticallyCentered } from "components/Common";
import { TextSmMedium, TextSmNormal } from "components/Text";
import { isWithinInterval, subMonths } from "date-fns";
import { colorClassToHexMap } from "pages/transactions/CategoryPill";
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
import { FilterKey } from "stores/transaction";
import tw from "twin.macro";
import {
  Category,
  GnosisSafeTransaction,
  GnosisSafeTransactionsTransfers,
  Type,
} from "types";
import { formatPercentage, formatToDollar } from "utils";
import { authGet, authPost } from "utils/fetch-wrapper";

import { ActiveShape, GraphHeader, GraphLegend } from "../common";

interface ExpenseByCategory {
  [categoryId: string]: {
    value: number;
    name: string;
    color: string;
  };
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
  const amount = formatToDollar(payload.value);

  return (
    <g>
      <text x={cx} y={cy - 13} dy={8} textAnchor="middle" fill="#475467">
        {payload.name}
      </text>
      <text x={cx} y={cy + 13} dy={8} textAnchor="middle" fill="#101828">
        {amount}
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

const Circle = tw.div`w-8px h-8px rounded-full`;

const renderLegend = (props: GraphLegend) => {
  const { payload } = props;

  return (
    <ul>
      {payload.map((entry) => (
        <VerticallyCentered className="gap-8px mb-4px" key={entry.payload.name}>
          <Circle style={{ backgroundColor: entry.color }} />
          <TextSmNormal
            className={
              entry.color === "#D0D5DD" ? "text-gray-400" : "text-gray-600"
            }
          >
            {formatPercentage(
              entry.payload.percent < 0 || entry.payload.percent === undefined
                ? 0
                : entry.payload.percent
            )}{" "}
            {entry.payload.name}
          </TextSmNormal>
        </VerticallyCentered>
      ))}
    </ul>
  );
};

interface Catgories {
  [categoryId: string]: Category;
}

const ExpenseByCategory = ({ graphPosition }: { graphPosition: string }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("12 months");
  const [transactions, setTransactions] = useState<
    Array<GnosisSafeTransaction>
  >([]);
  const [categoriesMap, setCategoriesMap] = useState<Catgories>({});

  const loadTransactions = async () => {
    setIsLoading(true);

    const filters = {
      [FilterKey.categoryId]: {},
      [FilterKey.type]: {
        outflow: true,
        outflow_transaction: true,
      },
    };

    const { categories } = await authGet({
      url: "transactions/categories",
    });

    categories.forEach((category: Category) => {
      // @ts-ignore
      filters[FilterKey.categoryId][category?.id ?? category.categoryName] =
        true;

      categoriesMap[category.id ?? category.categoryName] = category;
    });

    setCategoriesMap(categoriesMap);

    const originalDate = parseInt(date.trim().split(" ")[0]);
    const finalDate = originalDate * 2;

    const transactions: Array<GnosisSafeTransaction> = await authPost({
      url: "transactions",
      body: JSON.stringify({ ...filters, fromDate: `${finalDate} month` }),
    });

    setTransactions(transactions);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const processTransfers = (
    transfers: Array<GnosisSafeTransactionsTransfers>
  ) =>
    transfers.reduce(
      (reducer, val) =>
        val.direction === "inflow"
          ? reducer - val.valueUSD
          : reducer + val.valueUSD,
      0
    );

  const [finalTransactions, totalExpenses, previousTotalExpenses] =
    useMemo(() => {
      const categories: ExpenseByCategory = {};
      const originalDate = parseInt(date.trim().split(" ")[0]);

      const currentTransactions = transactions.filter((transaction) => {
        return isWithinInterval(new Date(transaction.executionDate), {
          start: subMonths(new Date(), originalDate),
          end: new Date(),
        });
      });

      const previousTransactions = transactions.filter((transaction) => {
        return !isWithinInterval(new Date(transaction.executionDate), {
          start: subMonths(new Date(), originalDate),
          end: new Date(),
        });
      });

      for (const transaction of currentTransactions) {
        const nativeTransactionValue =
          transaction.valueUSD && transaction.type !== Type.OUTFLOW
            ? transaction.valueUSD
            : 0;

        const totalTransactionValue =
          nativeTransactionValue +
          processTransfers(transaction.transfers ?? []);

        if (transaction.categoryId) {
          if (categories[transaction.categoryId]) {
            categories[transaction.categoryId].value += totalTransactionValue;
          } else {
            categories[transaction.categoryId] = {
              value: totalTransactionValue,
              name: categoriesMap[transaction.categoryId]?.categoryName ?? "",
              color: categoriesMap[transaction.categoryId]?.backgroundColor,
            };
          }
        }
      }

      let previousTotalExpenses = 0;

      for (const transaction of previousTransactions) {
        const nativeTransactionValue =
          transaction.valueUSD && transaction.type !== Type.OUTFLOW
            ? transaction.valueUSD
            : 0;

        const totalTransactionValue =
          nativeTransactionValue +
          processTransfers(transaction.transfers ?? []);

        previousTotalExpenses += totalTransactionValue;
      }

      const finalTransaction = Object.entries(categories)
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([, value], index) => ({
          value: value.value < 0 ? 0 : value.value,
          name: value.name,
          color:
            activeIndex === -1 || index === activeIndex
              ? colorClassToHexMap[value.color]
              : "#D0D5DD",
        }));

      const totalExpenses = finalTransaction.reduce(
        (reducer, val) => reducer + val.value,
        0
      );

      return [
        finalTransaction,
        totalExpenses,
        previousTotalExpenses < 0 ? 0 : previousTotalExpenses,
      ];
    }, [activeIndex, date, categoriesMap, transactions]);

  const innerRadius = useMemo(() => {
    const maxLength = Math.max(
      ...finalTransactions.map((finalTransactions) =>
        Math.max(
          formatToDollar(finalTransactions.value).length,
          finalTransactions.name.length
        )
      )
    );

    if (maxLength < 18) return 70;
    else if (maxLength < 20) return 80;
    else return 90;
  }, [finalTransactions]);

  return (
    <div>
      <GraphHeader
        graphPosition={graphPosition}
        title="EXPENSE BY CATEGORY"
        refreshGraph={loadTransactions}
        amount={finalTransactions.length}
        dateSetter={[date, setDate]}
      />
      <div style={{ height: 310 }} className="mr-auto ml-auto mt-0px flex">
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
          <>
            <span className="flex flex-col">
              <span className="font-medium text-30px ">
                {formatToDollar(totalExpenses)}
              </span>
              <TextSmMedium className="text-success-700">
                {formatPercentage(previousTotalExpenses / (totalExpenses || 1))}{" "}
                ({formatToDollar(previousTotalExpenses)})
              </TextSmMedium>
            </span>

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
                  data={finalTransactions}
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
                  {finalTransactions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseByCategory;
