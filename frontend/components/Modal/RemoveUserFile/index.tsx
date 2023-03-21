import { DefaultButton, PrimaryButton } from "components/Buttons";
import { TextLgSemibold, TextSmNormal } from "components/Text";
import { Trash2, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import { authDelete } from "utils/fetch-wrapper";

const RemoveUserFile = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const fileToDelete = useTransactions((state) => state.fileToDelete);
  const transaction = useTransactions((state) => state.transaction);
  const setTransaction = useTransactions((state) => state.setTransaction);
  const transactions = useTransactions((state) => state.transactions);
  const setTransactions = useTransactions((state) => state.setTransactions);

  return (
    <div className="bg-white w-400px p-24px rounded-12px flex flex-col">
      <div className="flex items-center justify-between mb-32px ">
        <div className="bg-error-50 w-48px h-48px rounded-full flex items-center justify-center">
          <Trash2 className="text-error-600" />
        </div>
        <span
          className="cursor-pointer"
          onClick={() => setModalContent(ModalContent.none)}
        >
          <X size={26} />
        </span>
      </div>
      <TextLgSemibold className="text-gray-900">
        Remove attachment
      </TextLgSemibold>
      <TextSmNormal className="text-gray-600 block mb-20px">
        Are you sure you want to remove {fileToDelete?.fileName}
      </TextSmNormal>

      <div className="flex mt-28px gap-12px justify-between">
        <DefaultButton
          onClick={() => setModalContent(ModalContent.none)}
          className="w-1/2"
        >
          Cancel
        </DefaultButton>{" "}
        <PrimaryButton
          className="text-16px !p-0 w-1/2"
          onClick={() => {
            authDelete({
              url: "transactions/image",
              body: JSON.stringify(fileToDelete),
            }).then(({ success }) => {
              if (success) {
                if (transaction) {
                  transaction.files = transaction?.files.filter(
                    (file) => file.id !== fileToDelete?.id
                  );

                  setTransaction({ ...transaction });

                  const transactionToUpdate = transactions.find(
                    (tran) => tran.id === transaction.id
                  );

                  if (transactionToUpdate) {
                    transactionToUpdate.files = transaction.files;
                    setTransactions(transactions);
                  }
                }

                setModalContent(ModalContent.none);
              }
            });
          }}
        >
          Confirm
        </PrimaryButton>
      </div>
    </div>
  );
};

export default RemoveUserFile;
