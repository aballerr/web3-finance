import { BgWhite } from "components/Colors";
import { Portal } from "components/Portal";
import { TextSmNormal, TextXsSmall } from "components/Text";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, Trash2, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useTransactions from "stores/transaction";
import tw from "twin.macro";
import { Category, GnosisSafeTransaction } from "types";
import { authPut } from "utils/fetch-wrapper";
import { getTransition } from "utils/styles";

const BasePill = tw.div`inline-block cursor-pointer px-12px py-4px text-14px rounded-16px`;

export const PillContainerOption = ({
  children,
  bg = "bg-orange-50",
  tc = "text-orange-700",
  onClick = () => true,
  disableHover = false,
}: {
  children: ReactNode;
  bg?: string;
  tc?: string;
  onClick?: () => void;
  disableHover?: boolean;
}) => {
  const hover = disableHover ? "" : "hover:bg-gray-50";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center py-4px pl-0px ${hover}`}
    >
      <BasePill className={`${bg} ${tc}`}>{children}</BasePill>
    </div>
  );
};

const DropDownContainer = tw.div`absolute bg-white w-300px shadow-lg z-80`;
const CategoryDropdownContainer = tw.div`absolute top-12px bg-white z-90 left-68px shadow-lg w-226px border-1px border-gray-100`;
const CategoryInputContainer = tw.input`py-8px px-12px bg-gray-50 outline-none`;
const DeleteContainer = tw.div`flex items-center mt-20px py-8px cursor-pointer gap-16px text-gray-700`;
const CreateContainer = tw.div`flex items-center pl-8px py-4px cursor-pointer bg-gray-50 gap-8px`;

interface Option {
  backgroundColor: string;
  textColor: string;
}

const ColorOption = ({
  option: { backgroundColor, textColor },
  isSelected,
  onClick,
}: {
  option: Option;
  onClick: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`flex items-center border-gray-300 py-8px gap-12px pl-8px cursor-pointer ${getTransition(
        !isSelected ? BgWhite : ""
      )} ${isSelected && "bg-gray-200"}`}
      onClick={onClick}
    >
      <div
        className={`w-28px h-28px border-1px ${backgroundColor} rounded-4px`}
      />
      <div>{textColor}</div>
    </div>
  );
};

interface CategoryProps {
  transaction: GnosisSafeTransaction;
  disabled?: boolean;
  setIsHovered?: (isHovered: boolean) => void;
}

const Options: Array<Option> = [
  {
    backgroundColor: "bg-gray-50",
    textColor: "Light gray",
  },
  {
    backgroundColor: "bg-gray-300",
    textColor: "Gray",
  },
  {
    backgroundColor: "bg-error-100",
    textColor: "Red",
  },
  {
    backgroundColor: "bg-orange-100",
    textColor: "Orange",
  },
  {
    backgroundColor: "bg-warning-100",
    textColor: "Yellow",
  },
  {
    backgroundColor: "bg-success-100",
    textColor: "Green",
  },
  {
    backgroundColor: "bg-blueLight-100",
    textColor: "Blue",
  },
  {
    backgroundColor: "bg-pink-100",
    textColor: "Pink",
  },
];

interface HexMapType {
  [key: string]: string;
}

export const colorClassToHexMap: HexMapType = {
  "bg-gray-50": "#F7FAFC",
  "bg-gray-300": "#E2E8F0",
  "bg-error-100": "#FED7D7",
  "bg-orange-100": "#FFF5F5",
  "bg-warning-100": "#FEFCBF",
  "bg-success-100": "#C6F6D5",
  "bg-blueLight-100": "#BEE3F8",
  "bg-pink-100": "#FBD5E0",
};

const defaultCategory = {
  backgroundColor: "bg-purple-50",
  categoryName: "+ Add",
  textColor: "text-purple-700",
};

const CategoryPill = ({
  transaction,
  disabled = false,
  setIsHovered = () => true,
}: CategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const setDelete = useTransactions((state) => state.setDelete);
  const setUpdateCategory = useTransactions((state) => state.setUpdateCategory);
  const setUpdate = useTransactions((state) => state.setUpdate);
  const categories = useTransactions((state) => state.categories);
  const setCategories = useTransactions((state) => state.setCategories);
  const transactions = useTransactions((state) => state.transactions);
  const setTransactions = useTransactions((state) => state.setTransactions);
  const setModalContent = useModal((state) => state.setModalContent);
  const [width, setWidth] = useState(0);
  const pillRef = useRef(null);

  const isDefaultCategory = useMemo(
    () => category.categoryName === "+ Add",
    [category]
  );

  useEffect(() => {
    if (pillRef && pillRef?.current) {
      // @ts-ignore
      setWidth(pillRef?.current?.clientWidth);
    }
  }, [category, pillRef, setWidth, isOpen]);

  const [editCategory, setEditCategory] = useState<null | Category>(null);

  const ref = useRef(null);
  const colorRef = useRef(null);
  const randomColor = useMemo(
    () => Options[Math.floor(Math.random() * Options.length)],
    []
  );

  useEffect(() => {
    const categoryId = transaction.categoryId;
    const category = categories.find((category) => category.id === categoryId);

    if (category) {
      setCategory({
        backgroundColor: category.backgroundColor,
        textColor: category.textColor,
        categoryName: category.categoryName,
      });
    } else {
      setCategory(defaultCategory);
    }
  }, [transaction, categories]);

  useEffect(() => {
    setIsHovered(isOpen);
  }, [isOpen, setIsHovered]);

  const activeEdit = useMemo(() => {
    return editCategory !== null;
  }, [editCategory]);

  const updateHover = () => {
    if (isOpen) {
      setIsHovered(false);
    }
  };

  const closeAll = () => {
    setIsOpen(false);
    setEditCategory(null);
    setSearchText("");
  };

  useOnClickOutside(ref, async () => {
    if (editCategory !== null) {
      try {
        await update();

        setEditCategory(null);
        setUpdate();
        setUpdateCategory();
        closeAll();
      } catch (err) {
        console.log(err);
      }
    } else {
      closeAll();
    }

    updateHover();
  });

  const categoriesFinal = useMemo(() => {
    return searchText.trim() !== ""
      ? categories.filter((category) => category.categoryName.match(searchText))
      : categories;
  }, [categories, searchText]);

  const updateCategory = (newCategory: Category) => {
    if (activeEdit) {
      setEditCategory(null);
      return;
    }

    authPut({
      url: "transactions",
      body: JSON.stringify({ transaction, newCategory }),
    }).then((response) => {
      const { category, isNew }: { category: Category; isNew: boolean } =
        response;

      if (category && category.id) {
        setCategory(category);
        setTransactions(transactions);
      }

      if (isNew) {
        categories.push(category);
        setCategories(categories);
        setIsOpen(false);
      }

      setIsOpen(false);
      setUpdate();
      setSearchText("");
      updateHover();
    });
  };

  const deleteCategory = () => {
    setModalContent(ModalContent.removeCategory);
    if (editCategory) {
      setDelete(editCategory);
    }
  };

  const canCreate = useMemo(() => {
    const cannotCreate = categories.find(
      (category) =>
        category.categoryName.trim().toLowerCase() === searchText.toLowerCase()
    );

    return searchText.trim() !== "" && cannotCreate === undefined;
  }, [categories, searchText]);

  const update = async () =>
    authPut({
      url: "transactions/category",
      body: JSON.stringify({ newCategory: editCategory }),
    });

  const removeCategory = async () => {
    transaction.categoryId = null;

    return authPut({
      url: "transactions",
      body: JSON.stringify({ transaction }),
    });
  };

  const closeEditOptions = async () => {
    try {
      if (editCategory !== null) {
        await update();
        setEditCategory(null);
        setUpdate();
        setUpdateCategory();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div ref={ref} className="relative">
      <Portal>
        {isOpen && <div className="absolute w-full h-full top-0 z-10" />}
      </Portal>
      <PillContainerOption
        disableHover
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);

            if (isOpen === false) {
              setIsHovered(true);
            }
          }
        }}
        bg={category.backgroundColor}
        tc={category.textColor}
      >
        {category.categoryName}
      </PillContainerOption>{" "}
      {isOpen && (
        <DropDownContainer className="rounded-8px animate-fadeIn top-0">
          <div className="relative">
            {!isDefaultCategory && (
              <BasePill
                className={`absolute !flex items-center gap-4px !cursor-default ${category.backgroundColor} ${category.textColor}`}
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: 0,
                }}
                ref={pillRef}
              >
                {category.categoryName}{" "}
                <X
                  className="cursor-pointer text-gray-500"
                  onClick={() => {
                    removeCategory().then(({ category }) => {
                      if (category === null) setCategory(defaultCategory);
                    });
                  }}
                  size={14}
                />
              </BasePill>
            )}

            <input
              className="w-full outline-none p-8px bg-gray-50"
              style={{ paddingLeft: isDefaultCategory ? 10 : width + 10 }}
              placeholder="Search for an option"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClick={closeEditOptions}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  if (canCreate) {
                    updateCategory({
                      categoryName: searchText,
                      backgroundColor: randomColor.backgroundColor,
                      textColor: "text-black",
                    });
                  }
                }
              }}
            />
          </div>
          <div
            onClick={closeEditOptions}
            className="text-gray-500 text-12px p-8px"
          >
            Select a category or create one
          </div>
          <div className="flex flex-col">
            {categoriesFinal.map((category) => {
              return (
                <div
                  className={`flex relative px-8px ${BgWhite} items-center`}
                  key={category.categoryName}
                >
                  <div
                    className="w-full"
                    onClick={() => {
                      updateCategory(category);
                      closeEditOptions();
                    }}
                  >
                    <PillContainerOption
                      bg={category.backgroundColor}
                      tc={category.textColor}
                      onClick={() => true}
                    >
                      {category.categoryName}
                    </PillContainerOption>
                  </div>

                  <MoreHorizontal
                    className="cursor-pointer text-gray-500 absolute right-8px"
                    size={16}
                    onClick={() => {
                      setEditCategory(category);
                    }}
                  />

                  {editCategory?.id === category.id && (
                    <CategoryDropdownContainer
                      className="animate-fadeIn"
                      ref={colorRef}
                      style={{
                        top: -120,
                      }}
                    >
                      <div className="p-16px">
                        <CategoryInputContainer
                          value={editCategory?.categoryName}
                          autoFocus
                          onChange={(e) => {
                            if (editCategory) {
                              setEditCategory({
                                ...editCategory,
                                categoryName: e.target.value,
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.keyCode === 13) {
                              closeEditOptions();
                            }
                          }}
                          placeholder="Category Name"
                        />
                        <DeleteContainer
                          className={BgWhite}
                          onClick={deleteCategory}
                        >
                          <Trash2 /> <TextSmNormal>Delete</TextSmNormal>
                        </DeleteContainer>
                      </div>
                      <div className="h-1px w-full bg-gray-100"></div>

                      <div className="px-16px py-4px">
                        <TextXsSmall className="text-gray-700">
                          colors
                        </TextXsSmall>
                      </div>
                      <div className="px-16px overflow-y-auto max-h-200px pb-8px">
                        {Options.map((option) => (
                          <ColorOption
                            key={option.backgroundColor}
                            option={option}
                            isSelected={
                              editCategory?.backgroundColor ===
                              option.backgroundColor
                            }
                            onClick={async () => {
                              setEditCategory({
                                ...category,
                                backgroundColor: option.backgroundColor,
                                categoryName:
                                  editCategory?.categoryName ||
                                  category.categoryName,
                              });
                            }}
                          />
                        ))}
                      </div>
                    </CategoryDropdownContainer>
                  )}
                </div>
              );
            })}
          </div>
          <div className="relative">
            {canCreate && (
              <CreateContainer
                onClick={() => {
                  updateCategory({
                    categoryName: searchText,
                    backgroundColor: randomColor.backgroundColor,
                    textColor: "text-black",
                  });
                }}
              >
                <span>Create</span>
                <PillContainerOption
                  onClick={() => null}
                  bg={randomColor.backgroundColor}
                  tc={randomColor.textColor}
                >
                  {searchText}
                </PillContainerOption>
              </CreateContainer>
            )}
          </div>
        </DropDownContainer>
      )}
    </div>
  );
};

export default CategoryPill;
