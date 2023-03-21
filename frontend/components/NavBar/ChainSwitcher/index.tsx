import { useWeb3React } from "@web3-react/core";
import { useOnClickOutside } from "hooks/useOnClickOutside";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";

import { getTransition } from "../../../utils/styles";
import chainOptions, { ChainOptionType } from "./chains";

const hover = getTransition("hover:bg-gray-50");

const ChainOption = ({
  chainOption,
  closeDropdown,
  fullWidth,
}: {
  chainOption: ChainOptionType;
  closeDropdown: () => void;
  fullWidth: boolean;
}) => {
  const { connector } = useWeb3React();
  const { iconSrc, ...activateOption } = chainOption;
  const width = fullWidth ? "w-full" : "w-170px";

  const connect = async () => {
    try {
      if (connector) {
        await connector.activate(activateOption);
        closeDropdown();
      }
    } catch (err) {
      console.log("failed chain switch");
    }
  };

  return (
    <div
      className={`flex flex-row py-16px items-center first:rounded-t last:rounded-b px-20px border-b-1px border-b-gray-300 last:border-none  bg-white select-none shadow-lg ${hover} ${width}`}
      onClick={connect}
    >
      <Image src={iconSrc} alt="chain option" />
      <div className="ml-8px text-gray-700">{activateOption.chainName}</div>
    </div>
  );
};

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chainId } = useWeb3React();
  const chainRef = useRef(null);
  const width = fullWidth ? "w-full" : "w-170px";

  const selectableChainOptions = useMemo(
    () => chainOptions.filter((chainOption) => chainOption.chainId !== chainId),
    [chainId]
  );

  useOnClickOutside(chainRef, () => setIsOpen(false));

  const { chainName, iconSrc } = useMemo(() => {
    return (
      chainOptions.find((chainOption) => chainOption.chainId === chainId) || {
        chainId: chainId,
        chainName: "Not Found",
        iconSrc: "",
      }
    );
  }, [chainId]);

  return (
    <div
      className="cursor-pointer relative"
      style={{ zIndex: 60 }}
      ref={chainRef}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-row py-12px items-center px-20px border-1px border-gray-300  rounded-30px select-none ${hover} ${width}`}
      >
        <Image src={iconSrc} alt="none" />
        <div className="ml-8px text-gray-700">{chainName}</div>
        <div className="ml-auto">
          {isOpen ? (
            <ChevronUp size={20} className="ml-12px text-gray-700" />
          ) : (
            <ChevronDown size={20} className="ml-12px text-gray-700" />
          )}
        </div>
      </div>
      {isOpen && (
        <div
          className={`${width} animate-fadeIn`}
          style={{ position: "absolute" }}
        >
          {selectableChainOptions.map((chainOption) => {
            return (
              <ChainOption
                key={chainOption.chainName}
                chainOption={chainOption}
                closeDropdown={() => setIsOpen(false)}
                fullWidth={!!fullWidth}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChainSwitcher;
