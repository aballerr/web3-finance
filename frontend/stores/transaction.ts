import { DateRange } from "react-day-picker";
import { Category, GnosisSafeTransaction, UserFiles } from "types";
import { authPost } from "utils/fetch-wrapper";
import create from "zustand";
import { devtools } from "zustand/middleware";

export enum SlideOutContent {
  none,
  transactionInfo,
}

export enum FilterKey {
  categoryId = "categoryId",
  type = "type",
  safes = "safes",
  assets = "assets",
}

export type FiltersType = {
  [key in FilterKey]: {
    [key: string]: boolean;
  };
};

interface Currency {
  tokenAddress: string;
  chainId: number;
  name: string;
}

interface FilterInfo {
  id?: number;
  filterName: string;
  filter: string;
  shared: boolean;
}

interface State {
  reset: () => void;
  categories: Array<Category>;
  filtersToSave: FilterInfo;
  savedFilters: Array<FilterInfo>;
  activeFilter: FilterInfo | null;
  filterToRemove: FilterInfo | null;
  fileToDelete: UserFiles | null;
  fileToPreview: UserFiles | null;
  loadTransactions: () => void;
  setFileToPreview: (fileToDelete: UserFiles) => void;
  setFileToDelete: (fileToDelete: UserFiles) => void;
  setActiveFilter: (activeFilter: FilterInfo | null) => void;
  setFilterToRemove: (filterToRemove: FilterInfo | null) => void;
  setSavedFilters: (savedFilters: Array<FilterInfo>) => void;
  setFiltersToSave: (filtersToSave: FilterInfo) => void;
  setCategories: (categories: Array<Category>) => void;
  currencies: Array<Currency>;
  setCurrencies: (currencies: Array<Currency>) => void;
  transaction: GnosisSafeTransaction | null;
  transactions: Array<GnosisSafeTransaction>;
  setTransaction: (transaction: GnosisSafeTransaction) => void;
  setTransactions: (transactions: Array<GnosisSafeTransaction>) => void;
  deleteCategory: Category | null;
  setDelete: (deleteCategory: Category | null) => void;
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
  from: string;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  fromOptions: Array<string>;
  setFromOptions: (fromOptions: Array<string>) => void;
  toOptions: Array<string>;
  setToOptions: (toOptions: Array<string>) => void;
  setFrom: (from: string) => void;
  to: string;
  setTo: (to: string) => void;
  update: string;
  updateCategory: string;
  setUpdate: () => void;
  setUpdateCategory: () => void;
}

const useTransactions = create<State>()(
  devtools(
    (set, get) => ({
      reset: () =>
        set(() => ({
          from: "",
          to: "",
          filters: {
            [FilterKey.categoryId]: {},
            [FilterKey.type]: {},
            [FilterKey.safes]: {},
            [FilterKey.assets]: {},
          },
          activeFilter: null,
        })),
      categories: [],
      deleteCategory: null,
      filtersToSave: {
        filterName: "",
        shared: false,
        filter: "",
      },
      fileToPreview: null,
      fileToDelete: null,
      setFileToPreview: (fileToPreview: UserFiles) =>
        set(() => ({ fileToPreview })),
      setFileToDelete: (fileToDelete: UserFiles) =>
        set(() => ({ fileToDelete })),
      activeFilter: null,
      filterToRemove: null,
      loadTransactions: async () => {
        const { filters, from, to, dateRange } = get();

        authPost({
          url: "transactions",
          body: JSON.stringify({ ...filters, from, to, dateRange }),
        }).then((transactions: Array<GnosisSafeTransaction>) => {
          const finalTransactions = transactions.map((transaction) => ({
            ...transaction,
            isChecked: false,
          }));

          set(() => ({ transactions: finalTransactions }));
        });
      },
      setActiveFilter: (activeFilter: FilterInfo | null) =>
        set(() => ({ activeFilter })),
      setFilterToRemove: (filterToRemove: FilterInfo | null) =>
        set(() => ({ filterToRemove })),
      setSavedFilters: (savedFilters: Array<FilterInfo>) =>
        set(() => ({ savedFilters })),
      savedFilters: [],
      setFiltersToSave: (filtersToSave: FilterInfo) =>
        set(() => ({ filtersToSave })),
      setDelete: (deleteCategory: Category | null) =>
        set(() => ({ deleteCategory: deleteCategory })),
      setCategories: (categories: Array<Category>) =>
        set(() => ({ categories })),
      currencies: [],
      setCurrencies: (currencies: Array<Currency>) =>
        set(() => ({ currencies })),
      transaction: null,
      transactions: [],
      setTransaction: (transaction: GnosisSafeTransaction) =>
        set(() => ({ transaction })),
      setTransactions: (transactions) => set(() => ({ transactions })),
      filters: {
        [FilterKey.categoryId]: {},
        [FilterKey.type]: {},
        [FilterKey.safes]: {},
        [FilterKey.assets]: {},
      },
      setFilters: (filters: FiltersType) => set(() => ({ filters })),
      setFrom: (from: string) => set(() => ({ from })),
      fromOptions: [],
      setFromOptions: (fromOptions: Array<string>) =>
        set(() => ({ fromOptions })),
      toOptions: [],
      setToOptions: (toOptions: Array<string>) => set(() => ({ toOptions })),
      from: "",
      to: "",
      dateRange: { from: undefined, to: undefined },
      setDateRange: (dateRange: DateRange) => set(() => ({ dateRange })),
      setTo: (to: string) => set(() => ({ to })),
      update: new Date().toString(),
      updateCategory: new Date().toString(),
      setUpdate: () => set(() => ({ update: new Date().toString() })),
      setUpdateCategory: () =>
        set(() => ({ updateCategory: new Date().toString() })),
    }),
    { name: "useTransactions" }
  )
);

export default useTransactions;
