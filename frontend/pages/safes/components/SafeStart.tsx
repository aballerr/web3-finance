import gnosisLargeIcon from "assets/images/svgs/gnosisLargeIcon.svg";
import Image from "next/image";
import { getTransition } from "utils/styles";

const bgHover = getTransition("hover:bg-primary-700");

const SafeStart = () => {
  return (
    <div className="flex justify-center">
      <div className="flex mt-100px rounded shadow-lg">
        <div
          className="flex align-items justify-center w-240px h-226px rounded-l-6px bg-gradient"
          style={{
            background: "linear-gradient(45deg, #1D2939 0%, #475467 100%)",
          }}
        >
          <Image src={gnosisLargeIcon} alt="gnosis" />
        </div>
        <div className="bg-white rounded-r-6px h-226px w-510px p-24px">
          <div className="text-gray-900 text-30px tracking-wide">
            Link Safe to get started
          </div>
          <div className="text-gray-600 text-14px tracking-wide text-14px mt-8px">
            Base58 helps you manage all your on-chain finance in one place,
            powered by Gnosis Safe.
          </div>
          <button
            className={`bg-primary-600 text-white py-10px px-70px rounded-6px mt-36px ${bgHover}`}
          >
            Link Safe
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeStart;
