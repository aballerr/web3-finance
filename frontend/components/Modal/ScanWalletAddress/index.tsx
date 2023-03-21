import { DefaultButton, PrimaryButton } from "components/Buttons";
import { SemiBold } from "components/Text";
import { useState } from "react";
// @ts-ignore
import QrReader from "react-qr-scanner";
import useModal, { ModalContent } from "stores/modal";
import useUserSafes from "stores/useUserSafesSetup";
import { shortenAddress } from "utils";

const previewStyle = {
  width: "100%",
  borderRadius: "12px",
};

const ScanWalletAddress = () => {
  const ownerScanningPosition = useUserSafes(
    (state) => state.ownerScanningPosition
  );
  const owners = useUserSafes((state) => state.owners);
  const setOwners = useUserSafes((state) => state.setOwners);
  const setModalContent = useModal((state) => state.setModalContent);
  const owner = owners.find((owner) => owner.key === ownerScanningPosition);
  const [address, setAddress] = useState("");

  return (
    <div className="bg-white w-400px h-500px rounded-12px p-24px">
      <SemiBold className="text-gray-900">Scan QR code</SemiBold>
      <div className="text-gray-600 my-12px">
        Address: <span>{shortenAddress(address)}</span>
      </div>
      <QrReader
        delay={100}
        style={previewStyle}
        // @ts-ignore
        onError={(e) => {
          console.log(e);
        }}
        // @ts-ignore
        onScan={(e) => {
          if (e === null) return;
          else {
            const { text } = e;
            const newAddress = text.includes(":") ? text.split(":")[1] : text;

            if (owner && newAddress && address !== newAddress) {
              setAddress(newAddress);
            }
          }
        }}
      />
      <div className="flex gap-12px mt-20px float-right">
        <DefaultButton
          onClick={() => {
            setModalContent(ModalContent.none);
          }}
        >
          {" "}
          Cancel{" "}
        </DefaultButton>{" "}
        <PrimaryButton
          onClick={() => {
            // @ts-ignore
            owner.address = address;
            setOwners([...owners]);
            setModalContent(ModalContent.none);
          }}
        >
          Save Address
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ScanWalletAddress;
