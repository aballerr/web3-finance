import { TextSmNormal, TextXlSemibold } from "components/Text";
import { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import useHomeSettings, { GraphTypes } from "stores/homeSettings";
import useTransactions from "stores/transaction";
import tw from "twin.macro";
import { ItemTypes } from "types";
import { authPost } from "utils/fetch-wrapper";

interface DropResult {
  graphPosition: string;
}

const GraphContainer = tw.div`w-160px h-80px border-1px border-gray-300 ml-auto mr-auto mb-24px flex items-center justify-center cursor-pointer`;

const GraphType = ({
  graphType,
  description,
}: {
  graphType: GraphTypes;
  description: string;
}) => {
  const graphSetup = useHomeSettings((state) => state.graphSetup);
  const setGraphSetup = useHomeSettings((state) => state.setGraphSetup);
  const [, drag] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: { graphType },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();

      if (item && dropResult) {
        const { graphType } = item;
        const { graphPosition } = dropResult;
        graphSetup[graphPosition] = graphType;
        setGraphSetup({ ...graphSetup });

        const body = {
          graphType,
          position: parseInt(graphPosition),
        };

        authPost({
          url: "graphs/company-graphs",
          body: JSON.stringify(body),
        }).then((res) => {
          console.log(res);
        });
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }));

  return (
    <GraphContainer ref={drag}>
      <TextSmNormal>{description}</TextSmNormal>
    </GraphContainer>
  );
};

const Header = tw.div`border-b pb-24px px-48px pt-20px flex`;
const TransactionContentContainer = tw.div`flex flex-col mt-28px w-400px`;

const GraphSelector = () => {
  const transaction = useTransactions((state) => state.transaction);

  const [addedFiles, setAddedFiles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (transaction?.files) {
      for (const file of transaction.files) {
        addedFiles[file.fileName] = true;
      }
      setAddedFiles({ ...addedFiles });
    }

    // eslint-disable-next-line
  }, [setAddedFiles, transaction]);

  return (
    <TransactionContentContainer>
      <GraphType
        graphType={GraphTypes.CRYPTO_HOLDINGS}
        description="Crypto Holdings"
      />
      {/* <GraphType
        graphType={GraphTypes.CRYPTO_ACCOUNTS}
        description="Crypto Accounts"
      /> */}
      {/* <GraphType graphType={GraphTypes.GAS_FEES} description="Gas Fees" /> */}
      <GraphType
        graphType={GraphTypes.CRYPTO_BY_ASSET}
        description="Crypto By Asset"
      />
      <GraphType
        graphType={GraphTypes.EXPENSE_BY_CATEGORY}
        description="Expense By Category"
      />
    </TransactionContentContainer>
  );
};

export const GraphSelectorHeader = () => {
  return (
    <Header>
      <div className="flex flex-col">
        <TextXlSemibold className="text-gray-900">Charts</TextXlSemibold>
        <TextSmNormal className="text-gray-600">
          Drag and drop to add
        </TextSmNormal>
      </div>
    </Header>
  );
};

export default GraphSelector;
