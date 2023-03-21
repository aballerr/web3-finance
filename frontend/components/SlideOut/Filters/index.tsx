import { DefaultButton, PrimaryButton } from "components/Buttons";
import { BgWhite, TextPrimary700 } from "components/Colors";
import {
  TextMdNormal,
  TextSmMedium,
  TextSmSemibold,
  TextXlSemibold,
} from "components/Text";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { getTokenLogoURI } from "hooks/useTokenLogo";
import Image from "next/image";
import { PillContainerOption } from "pages/transactions/CategoryPill";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import useTransactions, { FilterKey, FiltersType } from "stores/transaction";
import useUserSettings from "stores/userSettings";
import tw from "twin.macro";
import { GnosisSafeInfoResponse } from "types";
import { shortenAddress } from "utils";
import { getNativeToken } from "utils/chain";

const Container = tw.div`flex flex-col text-gray-700`;
const FilterSection = tw.div`flex flex-col mt-16px first:mt-0 relative`;
const Filterheader = tw(TextSmMedium)`inline-block mb-16px`;
const CategoryOption = tw.div`pl-12px gap-4px mb-4px flex items-center`;
const AddressInput = tw.input`border pl-40px py-8px w-full outline-none`;
const SavedFiltersDropdown = tw.div`border-1px border-gray-300 py-8px px-12px rounded-12px flex cursor-pointer relative `;

const Options = ({
  fromOptions,
  select,
}: {
  fromOptions: Array<string>;
  select: (fromOption: string) => void;
}) => {
  return (
    <div className="absolute w-400px h-80px bg-white z-50 shadow-lg overflow-y-auto cursor-pointer">
      {fromOptions.map((fromOption) => {
        return (
          <div
            key={fromOption}
            onClick={() => select(fromOption)}
            className="pl-12px py-4px hover:bg-gray-50"
          >
            {shortenAddress(fromOption, 12)}
          </div>
        );
      })}
    </div>
  );
};

const Filters = () => {
  const currencies = useTransactions((state) => state.currencies);
  const filters = useTransactions((state) => state.filters);
  const safes = useUserSettings((state) => state.safes);
  const setFilters = useTransactions((state) => state.setFilters);
  const from = useTransactions((state) => state.from);
  const fromOptions = useTransactions((state) => state.fromOptions);
  const toOptions = useTransactions((state) => state.toOptions);
  const setFrom = useTransactions((state) => state.setFrom);
  const to = useTransactions((state) => state.to);
  const setTo = useTransactions((state) => state.setTo);
  const setUpdate = useTransactions((state) => state.setUpdate);
  const setSlideOutContent = useSliderOut((state) => state.setSlideOutContent);
  const categories = useTransactions((state) => state.categories);
  const setModalContent = useModal((state) => state.setModalContent);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreCurrencies, setShowMoreCurrencies] = useState(false);
  const filtersToSave = useTransactions((state) => state.filtersToSave);
  const savedFilters = useTransactions((state) => state.savedFilters);
  const setFiltersToSave = useTransactions((state) => state.setFiltersToSave);
  const activeFilter = useTransactions((state) => state.activeFilter);
  const setActiveFilter = useTransactions((state) => state.setActiveFilter);
  const [savedFiltersIsOpen, setSavedFiltersIsOpen] = useState(false);
  const setFilterToRemove = useTransactions((state) => state.setFilterToRemove);

  const categoriesLimit = useMemo(
    () => (showMoreCategories ? categories.length : 3),
    [categories, showMoreCategories]
  );

  const currenciesLimit = useMemo(
    () => (showMoreCurrencies ? currencies.length : 3),
    [currencies, showMoreCurrencies]
  );

  const [finalSafes, setFinalSafes] = useState<Array<GnosisSafeInfoResponse>>(
    []
  );
  const [fromDropdownIsOpen, setFromDropdownIsOpen] = useState(false);
  const [toDropdownIsOpen, setToDropdownIsOpen] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const filterRef = useRef(null);

  useOnClickOutside(fromRef, () => setFromDropdownIsOpen(false));
  useOnClickOutside(toRef, () => setToDropdownIsOpen(false));
  useOnClickOutside(filterRef, () => setSavedFiltersIsOpen(false));

  useEffect(() => {
    if (safes && safes.length) {
      setFinalSafes(safes);
    }
  }, [safes, setFinalSafes]);

  const selectFromAndClose = (fromValue: string) => {
    setFrom(fromValue);
    setFromDropdownIsOpen(false);
  };

  const selectToAndClose = (fromValue: string) => {
    setTo(fromValue);
    setToDropdownIsOpen(false);
  };

  const clear = () => {
    for (const category of Object.keys(filters)) {
      // @ts-ignore
      for (const key of Object.keys(filters[category])) {
        // @ts-ignore
        filters[category][key] = false;
      }
    }

    setFilters({ ...filters });
    setFrom("");
    setTo("");
    setActiveFilter(null);
  };

  const saveFilters = () => {
    const filterInfo = {
      filters,
      from,
      to,
    };

    setFiltersToSave({
      ...filtersToSave,
      filter: JSON.stringify(filterInfo),
    });
    setModalContent(ModalContent.filterSave);
  };

  const cleanCopy = (obj: FiltersType) => {
    const finalObj = {
      [FilterKey.categoryId]: {},
      [FilterKey.type]: {},
      [FilterKey.safes]: {},
      [FilterKey.assets]: {},
    };

    for (const filterKey of Object.keys(obj)) {
      // @ts-ignore
      for (const [key, val] of Object.entries(obj[filterKey])) {
        if (val === true) {
          // @ts-ignore
          finalObj[filterKey][key] = val;
        }
      }
    }

    return finalObj;
  };

  const isTheSame = () => {
    if (activeFilter?.filter) {
      const active = JSON.parse(activeFilter?.filter);

      if (active.from !== from || active.to !== to) return false;

      const currentCopy = cleanCopy(filters);
      const activeCopy = cleanCopy(active.filters);

      return JSON.stringify(currentCopy) === JSON.stringify(activeCopy);
    }

    return false;
  };

  return (
    <Container className="py-20px w-400px max-h-full">
      <FilterSection ref={filterRef}>
        <SavedFiltersDropdown
          className={BgWhite}
          onClick={() => setSavedFiltersIsOpen(!savedFiltersIsOpen)}
        >
          <Filter className="mr-12px" />{" "}
          {activeFilter ? activeFilter.filterName : "Select saved filter"}
          {savedFiltersIsOpen ? (
            <ChevronUp className="ml-auto" />
          ) : (
            <ChevronDown className="ml-auto" />
          )}
        </SavedFiltersDropdown>
        <div className="relative">
          {savedFiltersIsOpen && (
            <div className="bg-white absolute shadow-lg w-full animate-fadeIn max-h-200px overflow-y-scroll z-10">
              {savedFilters.map((savedFilter) => {
                const setAF = () => {
                  setActiveFilter(savedFilter);
                  const filterObj = JSON.parse(savedFilter.filter);
                  setFrom(filterObj.from);
                  setTo(filterObj.to);
                  setFilters(filterObj.filters);
                  setSavedFiltersIsOpen(false);
                };

                return (
                  <div
                    key={savedFilter.id}
                    className={`py-8px p-12px cursor-pointer flex gap-12px items-center text-gray-600 ${BgWhite}`}
                  >
                    <TextSmMedium
                      onClick={setAF}
                      className="text-gray-700 whitespace-nowrap"
                    >
                      {savedFilter.filterName}
                    </TextSmMedium>
                    <TextMdNormal
                      className="text-gray-900"
                      onClick={() => {
                        setFilterToRemove(savedFilter);
                        setModalContent(ModalContent.removeFilter);
                      }}
                    >
                      remove
                    </TextMdNormal>
                    <div onClick={setAF} className="w-full flex items-center">
                      <div className="opacity-0 w-4px">c</div>
                      {activeFilter?.id === savedFilter.id && (
                        <Check className="ml-auto text-primary-700" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FilterSection>

      <FilterSection>
        {categories.length > 0 && (
          <>
            <Filterheader>Category</Filterheader>
            {categories.slice(0, categoriesLimit).map((category) => {
              return (
                <CategoryOption key={category.id}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const obj = filters[FilterKey.categoryId];
                      obj[category.id ?? category.categoryName] =
                        e.target.checked;
                      setFilters({ ...filters });
                    }}
                    checked={
                      filters[FilterKey.categoryId][
                        category.id ?? category.categoryName
                      ]
                    }
                  />{" "}
                  <PillContainerOption
                    bg={category.backgroundColor}
                    tc={category.textColor}
                    disableHover
                  >
                    {category.categoryName}
                  </PillContainerOption>
                </CategoryOption>
              );
            })}
            {categories.length > 3 && (
              <TextSmSemibold
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className={`!${TextPrimary700} cursor-pointer text-gray-900`}
              >
                {!showMoreCategories
                  ? `show ${categories.length - 3} more`
                  : "Show Less"}
              </TextSmSemibold>
            )}
          </>
        )}
      </FilterSection>
      <FilterSection>
        <Filterheader>Transaction Type</Filterheader>
        <CategoryOption>
          <input
            type="checkbox"
            onChange={(e) => {
              filters[FilterKey.type]["outflow"] = e.target.checked;
              filters[FilterKey.type]["outflow_transaction"] = e.target.checked;
              setFilters({ ...filters });
            }}
            checked={filters[FilterKey.type]["outflow"]}
          />{" "}
          <span>Send</span>
        </CategoryOption>
        <CategoryOption>
          <input
            type="checkbox"
            onChange={(e) => {
              filters[FilterKey.type]["inflow"] = e.target.checked;
              setFilters({ ...filters });
            }}
            checked={filters[FilterKey.type]["inflow"]}
          />{" "}
          <span>Receive</span>
        </CategoryOption>
      </FilterSection>
      <FilterSection>
        <>
          <Filterheader>Asset</Filterheader>
          {currencies.slice(0, currenciesLimit).map((currency) => {
            const tokenUri = getTokenLogoURI(
              currency.tokenAddress,
              currency.chainId
            );

            return (
              <CategoryOption key={currency.tokenAddress}>
                <input
                  className="mr-8px"
                  type="checkbox"
                  onChange={(e) => {
                    filters[FilterKey.assets][currency.tokenAddress] =
                      e.target.checked;

                    setFilters({ ...filters });
                  }}
                  checked={filters[FilterKey.assets][currency.tokenAddress]}
                />{" "}
                <Image
                  className="ml-12px"
                  src={tokenUri}
                  alt={currency.tokenAddress}
                  width="16"
                  height="16"
                />
                <TextSmMedium className="ml-4px text-gray-900">
                  {currency.name ?? getNativeToken(currency.chainId)}
                </TextSmMedium>
              </CategoryOption>
            );
          })}
          {currencies.length > 3 && (
            <TextSmSemibold
              onClick={() => setShowMoreCurrencies(!showMoreCurrencies)}
              className={`${TextPrimary700} cursor-pointer text-gray-900`}
            >
              {!showMoreCurrencies
                ? `show ${currencies.length - 3} more`
                : "Show Less"}
            </TextSmSemibold>
          )}
        </>
      </FilterSection>
      <FilterSection>
        <>
          <Filterheader>Safes</Filterheader>
          {finalSafes.map((safe) => {
            return (
              <CategoryOption key={safe.address}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const obj = filters[FilterKey.safes];
                    obj[safe.address] = e.target.checked;
                    setFilters({ ...filters });
                  }}
                  checked={filters[FilterKey.safes][safe.address]}
                />{" "}
                <span>{shortenAddress(safe.address, 12)}</span>
              </CategoryOption>
            );
          })}
        </>
      </FilterSection>
      <FilterSection>
        <div>
          <TextSmMedium className="text-gray-900">From</TextSmMedium>
        </div>
        <div ref={fromRef} className="relative w-full">
          <Search
            className="absolute left-12px text-gray-500"
            style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
            size={20}
          />
          <AddressInput
            value={from.length > 0 ? shortenAddress(from, 12) : ""}
            onClick={() => {
              setFromDropdownIsOpen(true);
            }}
            placeholder="Search"
            style={{ fontSize: 15 }}
          />
          {from && (
            <X
              className="absolute right-12px cursor-pointer"
              style={{ top: "50%", right: 4, transform: "translateY(-50%)" }}
              onClick={() => setFrom("")}
            />
          )}

          {fromDropdownIsOpen && (
            <Options select={selectFromAndClose} fromOptions={fromOptions} />
          )}
        </div>
      </FilterSection>
      <FilterSection>
        <div>
          <TextSmMedium className="text-gray-900">To</TextSmMedium>
        </div>
        <div ref={toRef} className="relative w-full">
          <Search
            className="absolute left-12px text-gray-500"
            style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
            size={20}
          />
          <AddressInput
            placeholder="Search"
            onClick={() => {
              setToDropdownIsOpen(true);
            }}
            style={{ fontSize: 15 }}
            value={to.length > 0 ? shortenAddress(to, 12) : ""}
          />

          {to && (
            <X
              className="absolute right-12px cursor-pointer"
              style={{ top: "50%", right: 4, transform: "translateY(-50%)" }}
              onClick={() => setTo("")}
            />
          )}

          {toDropdownIsOpen && (
            <Options select={selectToAndClose} fromOptions={toOptions} />
          )}
        </div>
      </FilterSection>
      <div className="flex mt-12px gap-20px items-center">
        <TextSmSemibold
          onClick={saveFilters}
          className={`${TextPrimary700} cursor-pointer text-gray-900`}
        >
          Save filter
        </TextSmSemibold>
        <DefaultButton onClick={clear} className="h-40px w-120px !px-0">
          Clear Filter
        </DefaultButton>
        <PrimaryButton
          className="h-40px w-100px"
          onClick={() => {
            const shouldUpdate = !isTheSame();
            if (activeFilter && shouldUpdate) {
              setModalContent(ModalContent.updateFilter);
            } else {
              setUpdate();
              setSlideOutContent(SlideOutContent.none);
            }
          }}
        >
          Done
        </PrimaryButton>
      </div>
    </Container>
  );
};

const Header = tw.div`border-b pb-24px px-48px pt-20px flex`;

export const FiltersHeader = () => {
  return (
    <Header>
      <div className="flex flex-col ml-16px">
        <TextXlSemibold className="text-gray-900">Filters</TextXlSemibold>
      </div>
    </Header>
  );
};

export default Filters;
