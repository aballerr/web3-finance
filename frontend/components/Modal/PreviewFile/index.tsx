import { DefaultButton } from "components/Buttons";
import { TextLgSemibold } from "components/Text";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { File, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import { authPost } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

const PrevewImage = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const fileToPreview = useTransactions((state) => state.fileToPreview);
  const [downloadUrl, setDownloadUrl] = useState("");
  const jwt = Cookies.get("jwt");

  useEffect(() => {
    authPost({
      url: "transactions/image/link",
      body: JSON.stringify(fileToPreview),
    }).then(({ success, url }) => {
      if (success) {
        setDownloadUrl(url);
      }
    });
  }, [fileToPreview, setDownloadUrl, jwt]);

  return (
    <div className="bg-white p-24px rounded-12px w-400px">
      <div className="flex justify-between">
        <div className="h-56px w-56px bg-success-50 flex items-center justify-center rounded-full">
          <div className="bg-success-100 w-48px h-48px rounded-full flex items-center justify-center">
            <File color="#039855" />
          </div>
        </div>
        <div
          onClick={() => setModalContent(ModalContent.none)}
          className="mt-8px text-gray-500 cursor-pointer"
        >
          <X size={26} />
        </div>
      </div>
      <TextLgSemibold className="text-primary-900 mt-20px block mb-8px">
        View attachment
      </TextLgSemibold>

      {downloadUrl.length > 0 && (
        <div className="mb-20px">
          {" "}
          <a
            href={downloadUrl}
            download={fileToPreview?.fileName}
            rel="noreferrer"
            target="_blank"
            className={`text-primary-700 ${getTransition(
              "hover:text-primary-800"
            )}`}
            style={{
              wordWrap: "break-word",
            }}
          >
            {fileToPreview?.fileName}
          </a>
        </div>
      )}

      <div className="flex justify-between">
        <DefaultButton
          onClick={() => {
            setModalContent(ModalContent.none);
          }}
          className="w-full"
        >
          Cancel
        </DefaultButton>
      </div>
    </div>
  );
};

export default PrevewImage;
