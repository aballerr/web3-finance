import ProgressBar from "@ramonak/react-progress-bar";
import paper from "assets/images/svgs/paper.svg";
import paperFailure from "assets/images/svgs/paperFailure.svg";
import paperSuccess from "assets/images/svgs/paperSuccess.svg";
import byteSize from "byte-size";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import { TextPrimary700 } from "components/Colors";
import { Checkmark } from "components/Icons";
import chainOptions from "components/NavBar/ChainSwitcher/chains";
import {
  TextSmMedium,
  TextSmNormal,
  TextSmSemibold,
  TextXlSemibold,
  TextXsNormal,
} from "components/Text";
import { format } from "date-fns";
import Image from "next/image";
import { IncomeCircle, SendCircle } from "pages/transactions";
import CategoryPill from "pages/transactions/CategoryPill";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import useTransactions from "stores/transaction";
import tw from "twin.macro";
import { Type } from "types";
import { getChainExplorer } from "utils/chain";
import { authPut, authUpload } from "utils/fetch-wrapper";
import web3 from "web3";

const Section = tw.div`flex flex-col mb-20px`;
const Header = tw.div`border-b pb-24px px-48px pt-20px flex`;
const TransactionContentContainer = tw.div`flex flex-col mt-28px`;
const LineHeader = tw(TextSmMedium)`text-gray-300`;
const LineContent = tw(TextSmMedium)`text-gray-900`;
const CryptoAmount = tw(TextSmSemibold)`text-gray-700`;
const CryptoAmountUSD = tw(TextSmNormal)`text-gray-600`;
const TextArea = tw.textarea`resize-none outline-none bg-gray-50 w-full rounded-12px p-12px text-12px h-80px`;
const PaperContainer = tw.div`w-32px h-32px rounded-full flex items-center justify-center mr-12px`;
const FileComponentWrapper = tw.div`flex p-16px mb-12px rounded-12px border-1px`;

const FileComponent = ({
  success,
  file,
  remove = () => true,
}: {
  success: boolean;
  file: File;
  remove?: () => void;
}) => {
  const border = success ? "border-primary-600" : "border-error-300";
  const bgColor = success ? "" : "bg-error-25";
  const [completed, setCompleted] = useState(0);
  const [intervalId, setIntervalId] = useState();

  useEffect(() => {
    const id = setInterval(() => {
      setCompleted((completed) => completed + 1);
    }, 10);

    // @ts-ignore
    setIntervalId(id);

    return () => {
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (completed == 100) {
      clearInterval(intervalId);
    }
  }, [intervalId, completed]);

  return (
    <FileComponentWrapper
      className={`${border} ${bgColor}`}
      style={{ maxWidth: 370 }}
    >
      <PaperContainer className={success ? "bg-primary-50" : "bg-error-50"}>
        <Image src={success ? paperSuccess : paperFailure} alt="failure" />
      </PaperContainer>
      <div
        className="text-ellipsis overflow-hidden whitespace-nowrap"
        style={{ width: "calc(100% - 100px)" }}
      >
        {success ? (
          <>
            <div className="flex flex-col">
              <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                {file.name}
              </div>
              <TextSmNormal className="text-gray-600">
                {byteSize(file.size).value}
                {byteSize(file.size).unit}
              </TextSmNormal>
            </div>
            <ProgressBar
              completed={100}
              barContainerClassName="rounded-12px"
              customLabel={undefined}
              bgColor="#4BD6A9"
              borderRadius="50px"
              height="8px"
              labelClassName="text-primary-600 text-0 hidden"
              transitionDuration="1s"
              animateOnRender
            />
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <TextSmNormal className="text-error-700">
                {byteSize(file.size).value}
                {byteSize(file.size).unit}
              </TextSmNormal>
              <div className="text-ellipsis overflow-hidden whitespace-nowrap text-error-600">
                {file.name}
              </div>
            </div>
            <TextSmSemibold className="text-error-700">
              Total file size exceeds 10MB
            </TextSmSemibold>
          </>
        )}
      </div>

      {success ? (
        <div className="ml-auto w-44px">
          <Checkmark
            color="white"
            className="bg-primary-600 !w-20px !h-20px ml-auto"
            size={12}
            strokeWidth={3.5}
          />
          <TextSmMedium className="inline-block text-gray-700 mt-16px">
            {completed}%
          </TextSmMedium>
        </div>
      ) : (
        <div className="ml-auto">
          <Trash2 onClick={remove} className="text-error-700 cursor-pointer" />
        </div>
      )}
    </FileComponentWrapper>
  );
};

const TransactionInfo = () => {
  const transaction = useTransactions((state) => state.transaction);
  const setTransaction = useTransactions((state) => state.setTransaction);
  const setSlideOutContent = useSliderOut((state) => state.setSlideOutContent);
  const setModalContent = useModal((state) => state.setModalContent);
  const setFileToDelete = useTransactions((state) => state.setFileToDelete);
  const directionText = transaction?.type === Type.INFLOW ? "Receive" : "Send";
  const suffix = transaction?.chainId === 137 ? "MATIC" : "ETH";
  const setFileToPreview = useTransactions((state) => state.setFileToPreview);
  const [tempMemo, setTempMemo] = useState(transaction?.memo ?? "");
  const [files, setFiles] = useState<Array<File>>([]);
  const [addedFiles, setAddedFiles] = useState<{ [key: string]: boolean }>({});
  const imageIconSrc =
    transaction?.chainId === 137
      ? chainOptions[1].iconSrc
      : chainOptions[0].iconSrc;

  const updateTransaction = () => {
    if (transaction) {
      transaction.memo = tempMemo;
      authPut({
        url: "transactions",
        body: JSON.stringify({ transaction }),
      })
        .then(() => {
          setSlideOutContent(SlideOutContent.none);
        })
        .catch(() => {
          setSlideOutContent(SlideOutContent.none);
        });
    }

    if (files.length > 0) {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        // @ts-ignore
        formData.append("type", file.type);
        formData.append("transactionId", `${transaction?.id}`);

        authUpload({
          url: "transactions/image/upload",
          body: formData,
        }).then((res) => {
          if (res.file && transaction) {
            transaction.files.push(res.file);
            setTransaction(transaction);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (transaction?.files) {
      for (const file of transaction.files) {
        addedFiles[file.fileName] = true;
      }
      setAddedFiles({ ...addedFiles });
    }

    // eslint-disable-next-line
  }, [setAddedFiles, transaction]);

  const onSelectFile = async (newFiles: Array<File>) => {
    const finalArray = [];

    for (const file of newFiles) {
      if (addedFiles[file.name]) continue;
      addedFiles[file.name] = true;
      finalArray.push(file);
    }

    setAddedFiles({ ...addedFiles });
    setFiles([...files, ...finalArray]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onSelectFile,
    accept: {
      "image/*": [".jpeg", ".png", ".pdf", ".jpg"],
    },
  });

  const errorCharacterCount = useMemo(() => tempMemo.length > 280, [tempMemo]);

  return (
    <TransactionContentContainer>
      <Section>
        <LineHeader>Method</LineHeader>
        <LineContent>{directionText}</LineContent>
      </Section>
      <Section>
        <LineHeader>Timestamp</LineHeader>
        <LineContent>
          {format(
            new Date(transaction?.executionDate ?? ""),
            "LLL d, yyyy hh:mm:ss"
          )}
        </LineContent>
      </Section>
      <Section>
        <LineHeader>From</LineHeader>
        <LineContent>{transaction?.from}</LineContent>
      </Section>
      <Section>
        <LineHeader>To</LineHeader>
        <LineContent>{transaction?.to}</LineContent>
      </Section>
      <Section>
        <LineHeader>Status</LineHeader>
        <span
          className="inline-block rounded-16px px-12px py-4px text-14px rounded-16px` bg-primary-50 text-primary-700 w-72px text-center"
          onClick={() => true}
        >
          Settled
        </span>
      </Section>
      <Section>
        <LineHeader>Category</LineHeader>
        {transaction && <CategoryPill transaction={transaction} />}
      </Section>
      <Section>
        <LineHeader>Amount</LineHeader>
        <div className="flex flex-row gap-8px">
          <div>
            <Image src={imageIconSrc} alt="currency" />
          </div>
          <div className="flex flex-col">
            <CryptoAmount>
              {web3.utils.fromWei(transaction?.value ?? "0")} {suffix}
            </CryptoAmount>
            <CryptoAmountUSD>
              $ {transaction?.valueUSD && transaction?.valueUSD.toPrecision(2)}
            </CryptoAmountUSD>
          </div>
        </div>
      </Section>
      <Section>
        <LineHeader>Network Fees</LineHeader>
        <div className="flex flex-row gap-8px">
          <div>
            <Image
              className="w-24px h-24px"
              src={imageIconSrc}
              alt="currency"
              style={{ width: 44, height: 44 }}
            />
          </div>
          <div className="flex flex-col">
            <CryptoAmount>
              - {web3.utils.fromWei(transaction?.txnFee ?? "0")} {suffix}
            </CryptoAmount>
            <CryptoAmountUSD>
              ${" "}
              {transaction?.txnFeeUSD && transaction?.txnFeeUSD.toPrecision(2)}
            </CryptoAmountUSD>
          </div>
        </div>
      </Section>
      <Section>
        <LineHeader>Memo</LineHeader>
        <div className={`flex flex-row gap-8px rounded-12px flex flex-col`}>
          <TextArea
            value={tempMemo}
            className={errorCharacterCount ? "border-2px border-error-300" : ""}
            onChange={(e) => {
              setTempMemo(e.target.value);
            }}
          ></TextArea>
          {errorCharacterCount && (
            <div className="text-12px text-error-700">
              Please keep your Memo under 280 characters.
            </div>
          )}
        </div>

        {transaction?.files && transaction.files.length > 0 && (
          <span className="inline-block">
            <LineHeader className="mt-28px mb-4px">Attachments</LineHeader>

            {transaction?.files.map((file) => (
              <span
                key={file.fileName}
                className="flex py-8px px-12px gap-8px border-1px border-gray-300 rounded-12px items-center mb-8px inline-block"
              >
                <Image src={paper} alt="paper" />{" "}
                <TextSmMedium
                  className="cursor-pointer text-gray-900"
                  onClick={() => {
                    setModalContent(ModalContent.previewFile);
                    setFileToPreview(file);
                  }}
                >
                  {file.fileName}
                </TextSmMedium>
                <X
                  size={20}
                  className="text-gray-400 ml-auto cursor-pointer"
                  onClick={() => {
                    setModalContent(ModalContent.removeFile);
                    setFileToDelete(file);
                  }}
                />
              </span>
            ))}
          </span>
        )}

        <LineHeader className="mt-28px mb-4px">Upload Attachments</LineHeader>

        <div
          className={`border-1px border-gray-300 rounded-12px max-h-100px h-100px cursor-pointer hover:bg-primary-25  ${
            isDragActive && "bg-primary-25"
          }`}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div className="text-center mt-24px">
            <div className="mt-8px">
              <TextSmSemibold className="text-primary-700 max-w-100px">
                Click to upload
              </TextSmSemibold>
              <TextSmNormal className="text-gray-600 ml-4px">
                or drag and drop
              </TextSmNormal>
            </div>
            <div>
              <TextXsNormal className="text-gray-600">
                PNG, JPG or PDF (max. 10mb)
              </TextXsNormal>
            </div>
          </div>
        </div>

        <div className="mt-12px">
          {files.length > 0 &&
            files.map((file) => (
              <FileComponent
                file={file}
                success={file.size <= 10000000}
                key={file.name}
                remove={() => {
                  const newFiles = files.filter((f2) => f2.name !== file.name);
                  setFiles(newFiles);
                }}
              />
            ))}
        </div>
        {/* <div className="flex flex-col mt-12px">
          {transaction?.files.map((file) => (
            <FileComponent success key={file.id}>
       
              <TextSmMedium>{file.fileName}</TextSmMedium>
            </FileComponent>
          ))}
        </div> */}
      </Section>
      <div className="flex gap-12px ml-auto pb-12px">
        <DefaultButton
          className="w-48px h-40px"
          onClick={() => setSlideOutContent(SlideOutContent.none)}
        >
          Cancel
        </DefaultButton>{" "}
        <PrimaryButton
          disabled={errorCharacterCount}
          className="w-48px h-40px"
          onClick={updateTransaction}
        >
          Update
        </PrimaryButton>
      </div>
    </TransactionContentContainer>
  );
};

export const Transactionheader = () => {
  const transaction = useTransactions((state) => state.transaction);
  const Icon = transaction?.type === Type.INFLOW ? IncomeCircle : SendCircle;

  return (
    <Header>
      <div>
        <Icon />
      </div>
      <div className="flex flex-col ml-16px">
        <TextXlSemibold className="text-gray-900">
          Transaction Details
        </TextXlSemibold>
        <TextSmSemibold
          className={`cursor-pointer ${TextPrimary700} ease-in transition duration-150 hover:text-primary-800`}
          onClick={() => {
            if (transaction) {
              const explorer = getChainExplorer(transaction.chainId);
              const url = `${explorer}/tx/${transaction.txnHash}`;

              window.open(url);
            }
          }}
        >
          View full details
        </TextSmSemibold>
      </div>
    </Header>
  );
};

export default TransactionInfo;
