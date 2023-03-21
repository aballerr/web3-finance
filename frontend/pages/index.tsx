import type { NextPage } from "next";
import CryptoHoldings from "pages/home/graphs/CryptoHoldings";
import CryptoByAsset from "pages/home/graphs/CrytpoByAsset";
import ExpenseByCategory from "pages/home/graphs/ExpenseByCategory";
import { useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import useHomeSettings, { GraphTypes } from "stores/homeSettings";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import { CompanyGraphs, ItemTypes } from "types";
import { authGet } from "utils/fetch-wrapper";

import GraphContainer, { GraphHeader } from "./home/graphs/common";

const useGraphs = (graphType: string, graphPosition: string) => {
  switch (graphType) {
    case GraphTypes.CRYPTO_HOLDINGS:
      return <CryptoHoldings graphPosition={graphPosition} />;
    case undefined:
      return null;
    case GraphTypes.NONE:
      return null;
    case GraphTypes.EXPENSE_BY_CATEGORY:
      return <ExpenseByCategory graphPosition={graphPosition} />;
    case GraphTypes.CRYPTO_BY_ASSET:
      return <CryptoByAsset graphPosition={graphPosition} />;
    default:
      return (
        <GraphContainer>
          <GraphHeader graphPosition={graphPosition} title={graphType} />
        </GraphContainer>
      );
  }
};

const Graph = ({ graphPosition }: { graphPosition: string }) => {
  const graphSetup = useHomeSettings((state) => state.graphSetup);
  const setSlideOutContent = useSliderOut((state) => state.setSlideOutContent);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop: () => ({ graphPosition }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const graphType = graphSetup[graphPosition];
  const graphSet =
    graphSetup[graphPosition] !== GraphTypes.NONE &&
    graphSetup[graphPosition] !== undefined;
  const graph = useGraphs(graphType, graphPosition);
  const isActive = canDrop && isOver;

  return (
    <div
      ref={drop}
      style={{ height: 400 }}
      className={`${
        graphSet
          ? "border-1px border-gray-200 bg-white"
          : "border-dashed border-1px border-gray-400 bg-gray-50"
      } shadow-md rounded-6px overflow-y-scroll ${
        isActive && !graphSet && "bg-gray-100"
      }`}
      onClick={() => {
        if (!graphSet) {
          setSlideOutContent(SlideOutContent.graphSelect);
        }
      }}
    >
      <div
        className="p-24px pt-0 min-h-full relative"
        id={`graph-${graphPosition}`}
      >
        {graph}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const graphSetup = useHomeSettings((state) => state.graphSetup);
  const setGraphSetup = useHomeSettings((state) => state.setGraphSetup);

  const graphs = useMemo(() => {
    const graphs = [];

    for (const key in graphSetup) {
      graphs.push(<Graph key={key} graphPosition={key} />);
    }
    return graphs;
  }, [graphSetup]);

  useEffect(() => {
    authGet({ url: "graphs/company-graphs" }).then(
      ({
        success,
        graphs,
      }: {
        success: boolean;
        graphs: Array<CompanyGraphs>;
      }) => {
        if (success && graphs && graphs.length) {
          for (const graph of graphs) {
            graphSetup[graph.position] = graph.graphType;
          }
          setGraphSetup({ ...graphSetup });
        }
      }
    );

    // eslint-disable-next-line
  }, []);

  return (
    <div
      className="grid gap-8px mt-20px mx-8px"
      style={{
        maxHeight: "calc(100% - 100px)",
        gridTemplateColumns: "1fr 1fr",
        overflowY: "scroll",
      }}
    >
      {graphs}
    </div>
  );
};

export default Home;
