import { useWeb3React } from "@web3-react/core";
import lightningIcon from "assets/images/svgs/lightningIcon.svg";
import profileIcon from "assets/images/svgs/profileIcon.svg";
import Base58Logo from "components/Base58Logo";
import useEagerlyConnect from "hooks/useEagerlyConnect";
import { useActiveWalletConnector } from "hooks/useEagerlyConnect";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, X } from "react-feather";
import useModal, { ModalContent } from "stores/modal";
import useUserSettings from "stores/userSettings";
import useUserSafes from "stores/useUserSafesSetup";
import tw from "twin.macro";
import { getTransition } from "utils/styles";

import ChainSwitcher from "./ChainSwitcher";
import ConnectedButton from "./WalletOptions";

const transition = getTransition("hover:bg-primary-700");

const ConnectButton = () => {
  const setModalContent = useModal((state) => state.setModalContent);

  return (
    <button
      className={`block bg-primary-500 py-12px px-20px text-white rounded-md ${transition} select-none`}
      onClick={() => setModalContent(ModalContent.walletSelect)}
    >
      Connect Wallet
    </button>
  );
};

const ProfileIcon = ({ profilePicture }: { profilePicture?: string }) => {
  const [errored, setErrored] = useState(false);

  return profilePicture && !errored ? (
    <picture>
      <img
        src={profilePicture}
        referrerPolicy="no-referrer"
        alt="profile"
        className="w-36px h-36px rounded-full"
        onError={() => {
          setErrored(true);
        }}
      />
    </picture>
  ) : (
    <span className="bg-gray-100 cursor-pointer flex rounded-full items-center justify-center w-40px h-40px select-none">
      <Image src={profileIcon} alt="hi" />
    </span>
  );
};

const LightningIcon = () => (
  <span className="cursor-pointer w-16px h-16px select-none">
    <Image src={lightningIcon} alt="lightning" />
  </span>
);

const UniversalSearch = tw.input`bg-gray-50 ml-12px p-16px w-400px pl-48px`;

const NavBar = ({ isSetup }: { isSetup: boolean }) => {
  const { account } = useWeb3React();
  const connector = useActiveWalletConnector();
  const userInfo = useUserSettings((state) => ({
    profilePicture: state.profilePicture,
    email: state.email,
  }));

  const steps = useUserSafes((state) => state.step);
  const headerText = steps > 2 ? "Import Safe" : "Get Started";

  const setModalContent = useModal((state) => state.setModalContent);

  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    setEmail(userInfo.email);
    setProfilePicture(userInfo.profilePicture);
  }, [userInfo.email, userInfo.profilePicture]);

  useEagerlyConnect();

  const LoggedInAndSetup = () => (
    <div className="bg-white min-w-full flex flex-row items-center justify-between h-72px">
      <div className="relative">
        <Search
          className="absolute left"
          style={{ left: 28, top: "50%", transform: "translateY(-50%)" }}
        />{" "}
        <UniversalSearch placeholder="Search transactions, wallets, users..." />
      </div>

      <div className="flex flex-row gap-24px  items-center mr-32px">
        <LightningIcon />
        <ProfileIcon profilePicture={profilePicture} />
        {account && <ChainSwitcher />}
        {account && connector ? <ConnectedButton /> : <ConnectButton />}
      </div>
    </div>
  );

  const LoggedInAndSettingup = () => (
    <div className="bg-white min-w-full flex flex-row items-center justify-between h-96px border-b-4px border-gray-100">
      <div className="pl-20px flex items-center text-30px text-normal">
        <Base58Logo />
        <div
          className=" bg-gray-200 h-48px w-1px mr-24px ml-20px"
          style={{ width: 1 }}
        ></div>
        <div className="text-normal text-30px">{headerText}</div>
      </div>
      <div className="flex items-center">
        <div className="flex gap-12px mr-20px">
          {email && <div className="font-bold">{email}</div>}
          <ProfileIcon profilePicture={profilePicture} />
        </div>

        <ConnectedButton />
        <X
          onClick={() => setModalContent(ModalContent.resetImportFlow)}
          size={24}
          className="mr-44px cursor-pointer ml-20px"
        />
      </div>
    </div>
  );

  return isSetup ? <LoggedInAndSetup /> : <LoggedInAndSettingup />;
};
export default NavBar;
