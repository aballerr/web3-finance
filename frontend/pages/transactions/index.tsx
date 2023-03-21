import "react-day-picker/dist/style.css";

import GreenArrow from "assets/images/svgs/GreenArrow.svg";
import RedArrow from "assets/images/svgs/RedArrow.svg";
import { PageHeader } from "components/Text";
import { format } from "date-fns";
import type { NextPage } from "next";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import useTransactions from "stores/transaction";
import tw from "twin.macro";
import { Type } from "types";
import { shortenAddress } from "utils";
import { authGet } from "utils/fetch-wrapper";
import web3 from "web3";

import CategoryPill from "./CategoryPill";
import Header from "./Header";

const Circle = tw.div`w-40px h-40px rounded-full flex items-center justify-center`;

export const IncomeCircle = () => (
  <Circle className="bg-success-100">
    <Image src={GreenArrow} alt="green-arrow" />
  </Circle>
);

export const SendCircle = () => (
  <Circle className="bg-error-100 ">
    <Image src={RedArrow} alt="red-arrow" />
  </Circle>
);

const TD = tw.td`text-left py-16px`;
const TH = tw.th`text-left pb-12px sticky top-60px z-40 bg-white py-20px pb-28px border-b-1px border-gray-100`;

interface Option {
  [key: string]: boolean;
}

const Safes: NextPage = () => {
  const transactions = useTransactions((state) => state.transactions);
  const setTransactions = useTransactions((state) => state.setTransactions);
  const loadTransactions = useTransactions((state) => state.loadTransactions);
  const fromOptions = useTransactions((state) => state.fromOptions);
  const setFromOptions = useTransactions((state) => state.setFromOptions);
  const toOptions = useTransactions((state) => state.toOptions);
  const setToOptions = useTransactions((state) => state.setToOptions);
  const update = useTransactions((state) => state.update);
  const updateCategory = useTransactions((state) => state.updateCategory);
  const setSavedFilters = useTransactions((state) => state.setSavedFilters);
  const [hoverDisabled, setHoverDisabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const setCategories = useTransactions((state) => state.setCategories);
  const setTransaction = useTransactions((state) => state.setTransaction);
  const setSlideOut = useSliderOut((state) => state.setSlideOutContent);
  const dateRange = useTransactions((state) => state.dateRange);

  useEffect(() => {
    const getFromOptions = () => {
      const options: Option = {};
      const allFrom: Array<string> = [];

      if (fromOptions.length > 0) return;

      for (const transaction of transactions) {
        if (options[transaction.from] === undefined) {
          allFrom.push(transaction.from);
          options[transaction.from] = true;
        }
      }

      setFromOptions(allFrom);
    };

    const getToOptions = () => {
      const options: Option = {};
      const allTo: Array<string> = [];

      if (toOptions.length > 0) return;

      for (const transaction of transactions) {
        if (options[transaction.to] === undefined) {
          allTo.push(transaction.to);
          options[transaction.to] = true;
        }
      }

      setToOptions(allTo);
    };

    getFromOptions();
    getToOptions();
  }, [
    transactions,
    fromOptions.length,
    setFromOptions,
    setToOptions,
    toOptions.length,
  ]);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line
  }, [setTransactions, update, dateRange]);

  useEffect(() => {
    authGet({
      url: "transactions/categories",
    }).then(({ categories, success }) => {
      if (success) {
        setCategories(categories);
      }
    });
  }, [updateCategory, setCategories]);

  useEffect(() => {
    authGet({ url: "transactions/filters" })
      .then(({ filters }) => {
        setSavedFilters(filters);
      })
      .catch();
  }, [setSavedFilters]);

  const setAllCheckBoxes = () => {
    const finalTransactions = transactions.map((transaction) => ({
      ...transaction,
      isChecked: !isChecked,
    }));

    setTransactions(finalTransactions);
    setIsChecked(!isChecked);
  };

  return (
    <div
      className={`relative pb-20px bg-white m-16px rounded-8px ${
        hoverDisabled ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
      style={{ maxHeight: "calc(90% - 96px)", minHeight: 600 }}
    >
      <PageHeader className="mb-20px text-gray-900">Transactions</PageHeader>
      <Header />
      <table
        className="w-full"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead className="text-gray-600 w-full">
          <tr>
            <TH className="pl-12px">
              <input
                checked={isChecked}
                onClick={() => {
                  setAllCheckBoxes();
                }}
                type="checkbox"
              />
            </TH>
            <TH>Date</TH>
            <TH className="w-160px">Category</TH>
            <TH>Type</TH>
            <TH>From</TH>
            <TH>To</TH>
            <TH>Amount</TH>
          </tr>
        </thead>
        <tbody>
          {transactions?.map((transaction) => {
            const Icon =
              transaction.type === Type.INFLOW ? IncomeCircle : SendCircle;
            const direction =
              transaction.type === Type.INFLOW ? "Receive" : "Send";
            const executionDate = new Date(transaction.executionDate);
            const transactionTextColor =
              transaction.type === Type.INFLOW
                ? "text-success-600"
                : "text-gray-900";
            const inflowText =
              transaction.type === Type.INFLOW
                ? transaction.value === null
                  ? ""
                  : "+"
                : "-";
            const cryptoType = transaction.chainId === 137 ? "MATIC" : "ETH";
            const value = transaction.value
              ? web3.utils.fromWei(transaction.value)
              : "0";

            const openLink = () => {
              setTransaction(transaction);
              setSlideOut(SlideOutContent.transactionInfo);
            };

            return (
              <tr
                key={`${transaction.txnHash}`}
                className={`bg-white px-12px border-b-1px ${
                  !hoverDisabled && "hover:bg-gray-50"
                }`}
              >
                <TD className="pl-12px ">
                  <input
                    checked={transaction.isChecked}
                    onClick={() => {
                      transaction.isChecked = !transaction.isChecked;
                      setTransactions([...transactions]);
                    }}
                    type="checkbox"
                  />
                </TD>
                <TD onClick={openLink} className="text-gray-900 cursor-pointer">
                  <div>{format(executionDate, "LLL d")}</div>
                  <div className="text-gray-600">
                    {format(executionDate, "yyyy")}
                  </div>
                </TD>
                <TD>
                  <CategoryPill
                    setIsHovered={setHoverDisabled}
                    transaction={transaction}
                  />
                </TD>
                <TD className="cursor-pointer" onClick={openLink}>
                  <div className="flex gap-12px">
                    <Icon />
                    <div className="text-gray-900 text-14px flex flex-col">
                      <div className="font-Medium">{direction}</div>
                      <div className="text-gray-600 text-14px">
                        {format(executionDate, "hh:mm aaaaa'm'")}
                      </div>
                    </div>
                  </div>
                </TD>
                <TD className="cursor-pointer" onClick={openLink}>
                  {shortenAddress(transaction.from)}
                </TD>
                <TD className="cursor-pointer" onClick={openLink}>
                  {shortenAddress(transaction.to)}
                </TD>
                <TD className="cursor-pointer" onClick={openLink}>
                  <div className={`${transactionTextColor} text-14px`}>
                    {inflowText} {parseFloat(value).toPrecision(3)} {cryptoType}
                  </div>
                  <div className="text-gray-600 text-14px">
                    ${transaction.valueUSD?.toFixed(2)}
                  </div>
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Safes;
