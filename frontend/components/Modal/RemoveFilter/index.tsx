import { ErrorButton, WhiteButton } from "components/Buttons";
import { TextLgSemibold, TextSmNormal } from "components/Text";
import { Trash2, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import { authDelete } from "utils/fetch-wrapper";

const RemoveFilter = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const filterToRemove = useTransactions((state) => state.filterToRemove);
  const setFilterToRemove = useTransactions((state) => state.setFilterToRemove);
  const savedFilters = useTransactions((state) => state.savedFilters);
  const setSavedFilters = useTransactions((state) => state.setSavedFilters);
  const setActiveFilter = useTransactions((state) => state.setActiveFilter);

  const submitDelete = () => {
    if (filterToRemove) {
      authDelete({
        url: `transactions/filters/${filterToRemove?.id}`,
      }).then(({ success }) => {
        if (success) {
          const newSavedFilters = savedFilters.filter(
            (savedFilter) => savedFilter.id !== filterToRemove.id
          );

          setSavedFilters(newSavedFilters);
          setFilterToRemove(null);
          setModalContent(ModalContent.none);
          setActiveFilter(null);
        }
      });
    }
  };

  return (
    <div className="bg-white p-24px w-400px rounded-12px">
      <div className="flex items-center justify-between mb-20px ">
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
      <div className="flex flex-col">
        <TextLgSemibold className="text-gray-900">
          Remove {filterToRemove?.filterName}
        </TextLgSemibold>
        <TextSmNormal className="text-gray-600">
          Are you sure you want to remove {filterToRemove?.filterName}?
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
            // submitDelete();
            submitDelete();
          }}
        >
          Remove
        </ErrorButton>
      </div>
    </div>
  );
};

export default RemoveFilter;
