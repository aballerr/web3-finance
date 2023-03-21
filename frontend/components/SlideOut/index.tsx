import { X } from "react-feather";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import tw from "twin.macro";

import Filters, { FiltersHeader } from "./Filters";
import GraphSelector, { GraphSelectorHeader } from "./Graphs";
import TransactionInfo, { Transactionheader } from "./TransactionInfo";

const Container = tw.div`absolute bg-white h-full w-full w-full z-10`;
const SlideOutContainer = tw.div`absolute bg-white h-full z-20 max-h-full overflow-y-scroll`;

interface SlideOutProps {
  isRight?: boolean;
}

const useSlideOutContent = () => {
  const slideOutContent = useSliderOut((state) => state.slideOutContent);
  switch (slideOutContent) {
    case SlideOutContent.transactionInfo:
      return <TransactionInfo />;
    case SlideOutContent.transactionFilters:
      return <Filters />;
    case SlideOutContent.graphSelect:
      return <GraphSelector />;
    default:
      return null;
  }
};

const useSlideOutHeader = () => {
  const slideOutContent = useSliderOut((state) => state.slideOutContent);
  switch (slideOutContent) {
    case SlideOutContent.transactionInfo:
      return <Transactionheader />;
    case SlideOutContent.transactionFilters:
      return <FiltersHeader />;
    case SlideOutContent.graphSelect:
      return <GraphSelectorHeader />;
    default:
      return null;
  }
};

const useShowBackground = () => {
  const slideOutContent = useSliderOut((state) => state.slideOutContent);

  switch (slideOutContent) {
    case SlideOutContent.graphSelect:
      return false;
    default:
      return true;
  }
};

const SlideOut = ({ isRight }: SlideOutProps) => {
  const position = isRight ? "left-0" : "right-0";
  const slideOutContent = useSlideOutContent();
  const slideOutHeader = useSlideOutHeader();
  const setSlideOutContent = useSliderOut((state) => state.setSlideOutContent);
  const showBackground = useShowBackground();

  return (
    slideOutContent && (
      <div>
        {" "}
        <SlideOutContainer
          className={`${position} animate-rightToLeft shadow-slideOut`}
          style={{
            zIndex: 70,
          }}
        >
          {" "}
          <div className="relative">
            <X
              onClick={() => {
                setSlideOutContent(SlideOutContent.none);
              }}
              className="cursor-pointer float-right text-gray-500 absolute"
              style={{ top: 20, right: 20 }}
            />{" "}
            {slideOutHeader}
          </div>
          <div className="px-48px">{slideOutContent}</div>
        </SlideOutContainer>
        {showBackground && (
          <Container
            style={{ backgroundColor: "rgba(52, 64, 84, 0.2", zIndex: 55 }}
            onClick={() => {
              setSlideOutContent(SlideOutContent.none);
            }}
          ></Container>
        )}
      </div>
    )
  );
};

export default SlideOut;
