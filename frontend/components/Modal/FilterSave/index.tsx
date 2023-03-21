import filterLines from "assets/images/svgs/filterLines.svg";
import { DefaultButton, PrimaryButton } from "components/Buttons";
import Switch from "components/Switch";
import { TextLgSemibold, TextSmMedium, TextSmNormal } from "components/Text";
import Image from "next/image";
import { X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import { authPost } from "utils/fetch-wrapper";

const FilterSave = () => {
  const filtersToSave = useTransactions((state) => state.filtersToSave);
  const savedFilters = useTransactions((state) => state.savedFilters);
  const setActiveFilter = useTransactions((state) => state.setActiveFilter);
  const setSavedFilters = useTransactions((state) => state.setSavedFilters);
  const setFiltersToSave = useTransactions((state) => state.setFiltersToSave);
  const setModalContent = useModal((state) => state.setModalContent);

  const saveFilter = () => {
    authPost({
      url: "transactions/filters",
      body: JSON.stringify(filtersToSave),
    }).then(({ filter, success }) => {
      if (success) {
        setSavedFilters([...savedFilters, filter]);
        setModalContent(ModalContent.none);
        setActiveFilter(filter);
      }
    });
  };

  return (
    <div className="bg-white w-400px p-24px rounded-12px flex flex-col">
      <div className="flex items-center justify-between mb-32px ">
        <div className="bg-green-50 w-48px h-48px rounded-full flex items-center justify-center">
          <Image src={filterLines} alt="filter lines" />
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
        Filter can be personal or shared with team.
      </TextSmNormal>
      <TextSmMedium className="text-gray-700">Filter Name</TextSmMedium>
      <input
        className="border-1px border-gray-300 py-8px px-12px rounded-12px mt-8px"
        placeholder="Filter name"
        value={filtersToSave.filterName}
        onChange={(e) =>
          setFiltersToSave({ ...filtersToSave, filterName: e.target.value })
        }
      />
      <div className="flex  mt-12px gap-12px">
        <Switch
          onClick={() => {
            setFiltersToSave({
              ...filtersToSave,
              shared: !filtersToSave.shared,
            });
          }}
        />{" "}
        <TextSmMedium className="text-gray-700">
          Share Filter with your team
        </TextSmMedium>
      </div>

      <div className="flex mt-28px justify-between">
        <DefaultButton style={{ width: "49%" }}>Cancel </DefaultButton>{" "}
        <PrimaryButton style={{ width: "49%" }} onClick={saveFilter}>
          Save
        </PrimaryButton>
      </div>
    </div>
  );
};

export default FilterSave;
