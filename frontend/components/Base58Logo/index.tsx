import base58Icon from "assets/images/svgs/base58Icon.svg";
import Image from "next/image";

const Base58Logo = () => {
  return (
    <div className={`flex gap-8px items-center h-48px`}>
      <Image src={base58Icon} alt="base58 icon" />
      <span className="text-2xl tracking-4px">BASE58</span>
    </div>
  );
};

export default Base58Logo;
