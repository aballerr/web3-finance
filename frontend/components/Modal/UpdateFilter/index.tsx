import { DefaultButton, PrimaryButton } from "components/Buttons";
import { TextLgSemibold, TextSmNormal } from "components/Text";
import { Save, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useSliderOut, { SlideOutContent } from "stores/slideOut";
import useTransactions from "stores/transaction";
import { authPut } from "utils/fetch-wrapper";

const FilterSave = () => {
  const setModalContent = useModal((state) => state.setModalContent);
  const activeFilter = useTransactions((state) => state.activeFilter);
  const setFrom = useTransactions((state) => state.setFrom);
  const setTo = useTransactions((state) => state.setTo);
  const setFilters = useTransactions((state) => state.setFilters);
  const setUpdate = useTransactions((state) => state.setUpdate);
  const setSlideOutContent = useSliderOut((state) => state.setSlideOutContent);
  const filters = useTransactions((state) => state.filters);
  const from = useTransactions((state) => state.from);
  const to = useTransactions((state) => state.to);

  const discardChanges = () => {
    if (activeFilter) {
      const filterObj = JSON.parse(activeFilter.filter);

      setFrom(filterObj.from);
      setTo(filterObj.to);
      setFilters(filterObj.filters);
      setModalContent(ModalContent.none);
    }
  };

  const updateFilter = () => {
    const filterInfo = {
      filters,
      from,
      to,
    };

    authPut({
      url: `transactions/filters/${activeFilter?.id}`,
      body: JSON.stringify(filterInfo),
    }).then(() => {
      setSlideOutContent(SlideOutContent.none);
      setModalContent(ModalContent.none);
      setUpdate();
    });
  };

  return (
    <div className="bg-white w-400px p-24px rounded-12px flex flex-col">
      <div className="flex items-center justify-between mb-32px ">
        <div className="bg-green-50 w-48px h-48px rounded-full flex items-center justify-center">
          <Save className="text-primary-600" />
        </div>
        <span
          className="cursor-pointer"
          onClick={() => setModalContent(ModalContent.none)}
        >
          <X size={26} />
        </span>
      </div>
      <TextLgSemibold className="text-gray-900">Save Filter</TextLgSemibold>
      <TextSmNormal className="text-gray-600 block mb-20px">
        Do you want to save or discard changes?
      </TextSmNormal>

      <div className="flex mt-28px gap-12px justify-between">
        <DefaultButton onClick={discardChanges} className="w-1/2">
          Discard
        </DefaultButton>{" "}
        <PrimaryButton className="text-16px !p-0 w-1/2" onClick={updateFilter}>
          Save Changes
        </PrimaryButton>
      </div>
    </div>
  );
};

export default FilterSave;
