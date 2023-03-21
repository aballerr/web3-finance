import { ErrorButton, WhiteButton } from "components/Buttons";
import { TextLgSemibold, TextSmNormal } from "components/Text";
import { Trash2, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import { authDelete } from "utils/fetch-wrapper";

const RemoveCategory = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const setDelete = useTransactions((state) => state.setDelete);
  const deleteCategory = useTransactions((state) => state.deleteCategory);
  const setUpdate = useTransactions((state) => state.setUpdate);
  const categories = useTransactions((state) => state.categories);
  const setCategories = useTransactions((state) => state.setCategories);

  const submitDelete = () => {
    if (deleteCategory) {
      authDelete({
        url: `transactions/category/${deleteCategory?.id}`,
      }).then(({ success }) => {
        if (success) {
          setUpdate();
          const updatedCategories = categories.filter(
            (category) => category.id !== deleteCategory?.id
          );
          setCategories(updatedCategories);
          setDelete(null);
          setModalContent(ModalContent.none);
        }
      });
    }
  };

  return (
    <div className="bg-white p-24px w-400px rounded-12px">
      <div className="flex items-center justify-between mb-40px ">
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

      <div>
        <TextLgSemibold className="text-gray-900">
          Remove category
        </TextLgSemibold>
      </div>
      <div>
        <TextSmNormal className="text-gray-600">
          Are you sure you want to remove this category?
        </TextSmNormal>
      </div>
      <div className="flex grid-cols-2 mt-24px gap-12px">
        <WhiteButton
          onClick={() => setModalContent(ModalContent.none)}
          className="w-1/2"
        >
          Cancel
        </WhiteButton>
        <ErrorButton
          className="w-1/2"
          onClick={() => {
            submitDelete();
          }}
        >
          Remove
        </ErrorButton>
      </div>
    </div>
  );
};

export default RemoveCategory;
