import { BgWhite } from "components/Colors";
import { TextSmMedium, TextSmNormal, TextSmSemibold } from "components/Text";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { toPng } from "html-to-image";
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Delete,
  Download,
  MoreHorizontal,
  RefreshCcw,
} from "react-feather";
import useHomeSettings, { GraphTypes } from "stores/homeSettings";
import tw from "twin.macro";
import { authDelete, authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

const GraphContainer = tw.div`flex flex-col w-full h-full bg-white relative`;
const DropdownContainer = tw.div`absolute shadow-lg border-1px border-gray-300 w-120px bg-white rounded-6px animate-fadeIn select-none z-50`;
const DropdownOption = tw.div`flex items-center gap-8px py-8px px-16px cursor-pointer first:rounded-t-6px last:rounded-b-6px text-gray-700`;

const Months: Array<string> = ["24 months", "12 months", "6 months", "1 month"];

export const COLORS = [
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

interface MonthDropdownProps {
  dateSetter: [string, Dispatch<SetStateAction<string>>];
}

const MonthDropdown = (props: MonthDropdownProps) => {
  const [date, setDate] = props.dateSetter;
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative text-gray-600 w-108px select-none month">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-cneter gap-8px cursor-pointer ${getTransition(
          "hover:text-gray-700"
        )}`}
      >
        <TextSmSemibold className="text-gray-900">{date}</TextSmSemibold>
        {!isOpen ? (
          <ChevronDown strokeWidth={1.5} />
        ) : (
          <ChevronUp strokeWidth={1.5} />
        )}
      </div>
      <div className="relative ">
        {isOpen && (
          <DropdownContainer style={{ marginLeft: -4 }}>
            {Months.map((month) => (
              <DropdownOption
                onClick={() => {
                  setDate(month);
                  setIsOpen(false);
                }}
                key={month}
                className={BgWhite}
              >
                <TextSmMedium className="text-gray-900">{month}</TextSmMedium>
              </DropdownOption>
            ))}
          </DropdownContainer>
        )}
      </div>
    </div>
  );
};

interface Option {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const OptionsDropdown = ({
  graphPosition,
  refreshGraph,
  title,
  disableExportToPng,
}: {
  graphPosition: string;
  refreshGraph: () => void;
  title: string;
  disableExportToPng?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const graphSetup = useHomeSettings((state) => state.graphSetup);
  const setGraphSetup = useHomeSettings((state) => state.setGraphSetup);

  useOnClickOutside(ref, () => setIsOpen(false));

  const Options: Array<Option> = useMemo(() => {
    return [
      {
        title: "Refresh",
        icon: <RefreshCcw size={16} className="text-gray-500" />,
        onClick: () => {
          refreshGraph();
          setIsOpen(false);
        },
      },
      {
        title: "Duplicate",
        icon: <Copy size={16} className="text-gray-500" />,
        onClick: () => {
          const currentGraph = graphSetup[graphPosition];
          const graphPositions = Object.keys(graphSetup);
          let currentPositon = `${
            parseInt(graphPositions[graphPositions.length - 1]) + 1
          }`;

          for (const key of Object.keys(graphSetup)) {
            if (graphSetup[key] === GraphTypes.NONE) {
              currentPositon = key;
              break;
            }
          }

          const body = {
            graphType: currentGraph,
            position: currentPositon,
          };

          authPost({
            url: "graphs/company-graphs",
            body: JSON.stringify(body),
          }).then(() => {
            graphSetup[currentPositon] = currentGraph;
            setGraphSetup({ ...graphSetup });
            setIsOpen(false);
          });
        },
      },
      {
        title: "Remove",
        icon: <Delete size={16} className="text-gray-500" />,
        onClick: () => {
          authDelete({
            url: "graphs/company-graph",
            body: JSON.stringify({ position: graphPosition }),
          }).then(({ success }) => {
            if (success) {
              graphSetup[graphPosition] = GraphTypes.NONE;
              setGraphSetup({ ...graphSetup });
              setIsOpen(false);
            }
          });
        },
      },
      {
        title: "Export PNG",
        icon: <Download size={16} className="text-gray-500" />,
        onClick: () => {
          const element = document.getElementById(`graph-${graphPosition}`);
          const filter = (node: HTMLElement) => {
            const exclusionClasses = ["horiz", "arrow", "month"];
            return !exclusionClasses.some((classname) =>
              node.classList?.contains(classname)
            );
          };

          if (element) {
            toPng(element, {
              cacheBust: true,
              backgroundColor: "white",
              filter,
            }).then((dataUrl) => {
              const link = document.createElement("a");
              link.download = `${title}.png`;
              link.href = dataUrl;
              link.click();
              setIsOpen(false);
            });
          }
        },
      },
    ];
  }, [graphPosition, graphSetup, refreshGraph, setGraphSetup, title]);

  return (
    <div className="relative horiz" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer"
      >
        <MoreHorizontal className="text-gray-500" />
      </div>
      {isOpen && (
        <DropdownContainer className="!w-180px" style={{ right: -12 }}>
          {Options.map((option) => {
            if (disableExportToPng && option.title === "Export PNG")
              return null;

            return (
              <DropdownOption
                onClick={option.onClick}
                className={BgWhite}
                key={option.title}
              >
                {option.icon}{" "}
                <TextSmMedium className="!text-gray-700">
                  {option.title}
                </TextSmMedium>
              </DropdownOption>
            );
          })}
        </DropdownContainer>
      )}
    </div>
  );
};

export const GraphHeader = ({
  graphPosition,
  title,
  refreshGraph = () => true,
  amount,
  dateSetter,
  disableExportToPng,
}: {
  graphPosition: string;
  title: string;
  refreshGraph?: () => void;
  amount?: number;
  dateSetter?: [string, Dispatch<SetStateAction<string>>] | undefined;
  disableExportToPng?: boolean;
}) => {
  return (
    <div className="pb-16px pt-24px top-0 flex justify-between sticky bg-white z-10">
      <div className="flex items-center">
        <TextSmNormal className="text-gray-900">{title}</TextSmNormal>
        {amount !== undefined && amount > 0 && (
          <div className="text-12px font-medium text-gray-700 w-24px h-24px flex items-center justify-center bg-gray-100 rounded-full mx-8px ">
            {amount}
          </div>
        )}
        <ArrowRight className="text-gray-600 arrow" strokeWidth={1.5} />
      </div>
      <div className="flex gap-24px">
        {dateSetter !== undefined && <MonthDropdown dateSetter={dateSetter} />}
        <OptionsDropdown
          refreshGraph={refreshGraph}
          graphPosition={graphPosition}
          title={title}
          disableExportToPng={disableExportToPng}
        />
      </div>
    </div>
  );
};

export default GraphContainer;

// types
export interface ActiveShape {
  color: string;
  cornerRadius: undefined;
  cx: number;
  cy: number;
  endAngle: number;
  fill: string;
  innerRadius: number;
  maxRadius: number;
  midAngle: number;
  middleRadius: number;
  name: string;
  outerRadius: number;
  paddingAngle: number;
  payload: {
    cx: string;
    cy: string;
    fill: string;
    name?: string;
    stroke: string;
    symbol: string;
    value: number;
    valEth: string;
  };
  percent: number;
  percentage: string;
  startAngle: number;
  stroke: string;
  symbol: string;
  // tooltipPayload: [{…}],
  tooltipPosition: { x: number; y: number };
  valEth: string;
  value: number;
}

export interface GraphLegend {
  align: string;
  chartHeight: number;
  chartWidth: number;
  content: () => void;
  iconSize: string;
  iconType: string;
  layout: string;
  margin: { top: number; right: number; bottom: number; left: number };
  onBBoxUpdate: () => void;
  payload: Array<{
    color: string;
    type: string;
    value: string;
    payload: { name: string; percentage: number; percent: number };
  }>;
  verticalAlign: string;
}
