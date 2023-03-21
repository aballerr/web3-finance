import base58Icon from "assets/images/svgs/base58Icon.svg";
import briefcaseIcon from "assets/images/svgs/briefcaseIcon.svg";
import gnosisIcon from "assets/images/svgs/gnosisIcon.svg";
import hamburgerIcon from "assets/images/svgs/hamburgerIcon.svg";
import houseIcon from "assets/images/svgs/houseIcon.svg";
import safesIcon from "assets/images/svgs/safesIcon.svg";
import transactionsIcon from "assets/images/svgs/transactionsIcon.svg";
import usersIcon from "assets/images/svgs/usersIcon.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { getTransition } from "utils/styles";

interface OptionProps {
  description: string;
  icon: string;
  isOpen: boolean;
  onClick?: () => void;
}

const transition = getTransition("hover:bg-primary-50");

const Option = (props: OptionProps) => {
  const { description, icon, isOpen, onClick } = props;
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className={`flex pl-12px flex-row items-center py-20px px-8px cursor-pointer h-48px rounded ${transition}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <Image
        style={{
          filter: isHover
            ? "invert(78%) sepia(12%) saturate(1756%) hue-rotate(107deg) brightness(93%) contrast(89%)"
            : undefined,
        }}
        src={icon}
        alt="icon"
      />
      {isOpen && (
        <span className="ml-32px font-semibold text-gray-800">
          {description}
        </span>
      )}
    </div>
  );
};

const Safes = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="border-solid rounded-md border-black-300 border-1px h-80px my-32px flex items-center justify-space-between text-24px pl-12px">
      <Image className="ml-28px" src={gnosisIcon} alt="gnosis icon" />
      {isOpen && (
        <div className="text-gray-700 flex flex-col ml-28px">
          <div className="text-16px font-semibold">main-safe</div>
          <div className="text-30px text-30px">$1,000.00</div>
        </div>
      )}
    </div>
  );
};

const NavbarVertical = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const styleBottom = isOpen ? "" : "hidden";
  const styleNavWidth = isOpen ? "w-304px" : "w-84px";

  return (
    <div
      className={`h-full bg-white px-16px relative ${styleNavWidth}`}
      style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #F2F4F7 100%)" }}
    >
      <div className="flex flex-row items-center mt-28px text-16px">
        <div className="w-48px h-48px bg-primary-500 flex items-center justify-center rounded-full">
          <Image src={briefcaseIcon} alt="briefcase icon" />
        </div>
        {isOpen && (
          <span className="ml-16px font-semibold text-gray-800">
            Base58 Labs
          </span>
        )}
      </div>
      <Safes isOpen={isOpen} />
      <div className="grid gap-y-16px">
        <Option
          icon={houseIcon}
          isOpen={isOpen}
          description="Home"
          onClick={() => router.push("/")}
        />
        <Option
          icon={transactionsIcon}
          isOpen={isOpen}
          description="Transactions"
          onClick={() => router.push("/transactions")}
        />
        <Option icon={safesIcon} isOpen={isOpen} description="Safes" />
        <Option icon={usersIcon} isOpen={isOpen} description="Users" />
      </div>
      <div className="absolute flex gap-8px items-center left-24px bottom-28px h-48px">
        <Image
          className="cursor-pointer"
          src={hamburgerIcon}
          alt="hamburger icon"
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className={`flex gap-8px items-center h-48px ${styleBottom}`}>
          <Image src={base58Icon} alt="base58 icon" />
          <span className="text-2xl tracking-4px">BASE58</span>
        </div>
      </div>
    </div>
  );
};

export default NavbarVertical;
