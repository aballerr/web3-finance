import create from "zustand";
import { devtools } from "zustand/middleware";

export enum SlideOutContent {
  none,
  transactionInfo,
  transactionFilters,
  graphSelect,
}

interface State {
  slideOutContent: SlideOutContent;
  setSlideOutContent: (slideOutContent: SlideOutContent) => void;
}

const useSliderOut = create<State>()(
  devtools(
    (set) => ({
      slideOutContent: SlideOutContent.none,
      setSlideOutContent: (slideOutContent) => set(() => ({ slideOutContent })),
    }),
    { name: "useSlideOut" }
  )
);

export default useSliderOut;
