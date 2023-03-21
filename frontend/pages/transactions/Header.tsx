import { DefaultButton, PrimaryButton, WhiteButton } from "components/Buttons";
import { format } from "date-fns";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { useEffect, useMemo, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { DateRange, DayPicker } from "react-day-picker";
import { Calendar, ChevronDown, Filter, X } from "react-feather";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import useTransactions from "stores/transaction";
import tw from "twin.macro";
import { useIsMounted } from "utils/next";

const DateInput = tw.div`border-gray-300 border-1px px-12px py-8px w-120px h-42px`;
const bookedStyle = { border: "0px solid white" };

const Header = () => {
  const setDateRange = useTransactions((state) => state.setDateRange);
  const setUpdate = useTransactions((state) => state.setUpdate);
  const isMounted = useIsMounted();
  const reset = useTransactions((state) => state.reset);
  const [itemsToDownload, setItemsToDownload] = useState([[]]);
  const [calenderIsOpen, setCalendarIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const ref = useRef(null);
  const filters = useTransactions((state) => state.filters);
  const update = useTransactions((state) => state.update);
  const from = useTransactions((state) => state.from);
  const to = useTransactions((state) => state.to);
  const transactions = useTransactions((state) => state.transactions);
  const dateRange = useTransactions((state) => state.dateRange);
  const [navButtonUpdated, setNavbuttonUpdated] = useState(false);
  const [monthChanged, setMonthChanged] = useState(new Date());
  const [prevStart, setPrevStart] = useState<Element>();
  const [prevEnd, setPrevEnd] = useState<Element>();
  const setSlideOut = useSliderOut((state) => state.setSlideOutContent);

  const filtersActive = useMemo(() => {
    for (const filter of Object.values(filters)) {
      for (const value of Object.values(filter)) {
        if (value) return value;
      }
    }

    return from !== "" || to !== "";

    // eslint-disable-next-line
  }, [update]);

  const bookedDays = useMemo(() => {
    const days = transactions.map(
      (transaction) => new Date(transaction.executionDate)
    );

    return days;
  }, [transactions]);

  const fromText = useMemo(
    () => (range?.from ? format(range.from, "LLL d, yyyy") : ""),
    [range?.from]
  );

  const toText = useMemo(
    () => (range?.to ? format(range.to, "LLL d, yyyy") : ""),
    [range?.to]
  );

  const dateText = useMemo(() => {
    const fromText = dateRange.from
      ? format(dateRange.from, "LLL d, yyyy")
      : "";
    const toText = dateRange.to
      ? format(dateRange.to, "LLL d, yyyy")
      : "present";

    if (dateRange.from || dateRange.to) {
      return `${fromText} - ${toText}`;
    }

    return "Select Date";
  }, [dateRange]);

  const dateIsActive = useMemo(
    () => !!(dateRange.from || dateRange.to),
    [dateRange]
  );

  useOnClickOutside(ref, () => setCalendarIsOpen(false));

  useEffect(() => {
    if (calenderIsOpen) {
      const elements = document.getElementsByClassName(
        "rdp-button_reset rdp-button rdp-day"
      );

      // @ts-ignore
      for (const element of elements) {
        if (element.style.border === bookedStyle.border) {
          const textContent = element.textContent;
          const style =
            "height: 5px; width: 5px; background-color: #98A2B3; border-radius: 50%; position: absolute; left: 50%; transform: translateX(-50%); bottom: -1px;";

          element.innerHTML = `<div style="position: relative;">${textContent} <div style="${style}"></div></div>`;
        }
      }
    }

    if (calenderIsOpen && navButtonUpdated === false) {
      const navButtons =
        window.document.getElementsByClassName("rdp-nav_button");

      for (let i = 0; i < navButtons.length; i++) {
        const button = navButtons[i];

        // @ts-ignore
        button.addEventListener(
          "click",
          () => {
            setTimeout(() => {
              setMonthChanged(new Date());
            }, 10);
          },
          false
        );
      }

      setNavbuttonUpdated(true);
    }
  }, [calenderIsOpen, monthChanged, navButtonUpdated, setNavbuttonUpdated]);

  useEffect(() => {
    const startDate = window.document.getElementsByClassName(
      "rdp-day_range_start"
    );
    const endDate = window.document.getElementsByClassName("rdp-day_range_end");

    if (prevEnd) {
      prevEnd.parentElement?.classList.remove("edge-date-end");
    }

    if (prevStart) {
      prevStart.parentElement?.classList.remove("edge-date-start");
    }

    if (endDate.length) {
      setPrevStart(startDate[0]);
      endDate[0].parentElement?.classList.add("edge-date-end");
    }

    if (startDate.length) {
      setPrevEnd(endDate[0]);
      startDate[0].parentElement?.classList.add("edge-date-start");
    }
  }, [range, setPrevStart, setPrevEnd, prevEnd, prevStart]);

  return (
    <div
      className="bg-white top-0 sticky b-white py-12px px-12px flex items-center mt-20px"
      style={{ zIndex: 51 }}
    >
      <div className="relative inline-block items-center flex gap-16px">
        <div className="relative">
          <span ref={ref}>
            <div className="relative">
              <WhiteButton
                onClick={() => {
                  setCalendarIsOpen(!calenderIsOpen);
                }}
                className={`flex gap-8px items-center ${
                  dateIsActive
                    ? "bg-primary-50 hover:!bg-primary-50 !border-primary-50"
                    : ""
                }`}
              >
                <Calendar className={dateIsActive ? "text-primary-700" : ""} />
                {/* <TextSmSemibold
                  className={`flex items-center font-normal ${
                    dateIsActive && "text-primary-700"
                  }`}
                >
            
                </TextSmSemibold> */}
                <span className={dateIsActive ? "text-primary-700" : ""}>
                  {dateText}{" "}
                </span>

                {dateIsActive && <X className="opacity-0" size={12} />}
              </WhiteButton>
              {dateIsActive && (
                <X
                  size={20}
                  className="absolute text-primary-700 cursor-pointer hover:text-primary-800 transition duration-150"
                  style={{
                    top: "50%",
                    right: 15,
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined });
                  }}
                />
              )}
            </div>

            <div className="absolute bg-white shadow-lg" ref={ref}>
              {calenderIsOpen && (
                <div className="animate-fadeIn">
                  <DayPicker
                    showOutsideDays
                    mode="range"
                    modifiers={{ booked: bookedDays }}
                    modifiersStyles={{ booked: bookedStyle }}
                    defaultMonth={range?.from || new Date()}
                    selected={range}
                    onSelect={setRange}
                    components={{
                      Head: () =>
                        isMounted ? (
                          <div className="flex relatve h-40px my-8px">
                            <div
                              className="absolute flex gap-8px items-center"
                              style={{
                                left: "50%",
                                transform: "translateX(-50%)",
                              }}
                            >
                              <DateInput>{fromText}</DateInput>{" "}
                              <div style={{ left: 140 }}>-</div>
                              <DateInput style={{ left: 200 }}>
                                {toText}
                              </DateInput>
                            </div>
                          </div>
                        ) : null,
                    }}
                  />
                  <div className="border-t-1px border-gray-200 pb-8px"></div>
                  <div className="flex w-280px ml-auto mr-auto justify-between pb-8px ">
                    <DefaultButton
                      onClick={() => {
                        setCalendarIsOpen(false);
                        setRange(undefined);
                        setDateRange({ from: undefined, to: undefined });
                      }}
                      className="h-48px w-136px"
                    >
                      Clear
                    </DefaultButton>
                    <PrimaryButton
                      onClick={() => {
                        if (range) {
                          setDateRange(range);
                        } else {
                          setDateRange({ from: undefined, to: undefined });
                        }
                        setCalendarIsOpen(false);
                      }}
                      className="h-48px w-136px"
                    >
                      Confirm
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </div>
          </span>
        </div>
        <div className="relative">
          <WhiteButton
            onClick={() => setSlideOut(SlideOutContent.transactionFilters)}
            className={`flex flex-row gap-8px ${
              filtersActive &&
              "!text-primary-700 bg-primary-50 !border-primary-50 hover:!bg-primary-50"
            }`}
          >
            <Filter /> Filters
            {filtersActive && <X className="opacity-0" size={12} />}
          </WhiteButton>
          {filtersActive && (
            <X
              className="text-primary-700 absolute pointer hover:text-primary-800 transition duration-150 cursor-pointer"
              onClick={() => {
                reset();
                setUpdate();
              }}
              style={{ top: "50%", transform: "translateY(-50%)", right: 15 }}
              size={20}
            />
          )}
        </div>
      </div>

      <div className="ml-auto flex">
        <div>
          <CSVLink
            asyncOnClick={true}
            onClick={(event, done) => {
              if (transactions.length === 0) return [];
              const finalValues = [];
              const headers = Object.keys(transactions[0]);
              finalValues.push(headers.slice(0, headers.length - 1));

              for (const transaction of transactions) {
                if (transaction.isChecked) {
                  const values = Object.values(transaction);
                  finalValues.push(values.slice(0, values.length - 1));
                }
              }

              // @ts-ignore
              setItemsToDownload(finalValues);
              done();
            }}
            filename={"my-file.csv"}
            data={itemsToDownload}
          >
            <WhiteButton>
              <span className="flex gap-16px">
                Export <ChevronDown />{" "}
              </span>
            </WhiteButton>
          </CSVLink>
        </div>
      </div>
    </div>
  );
};

export default Header;
