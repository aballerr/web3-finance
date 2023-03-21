import { Checkmark } from "components/Icons";
import { useState } from "react";
import { X } from "react-feather";

const Banner = ({
  body,
  header,
  success,
}: {
  body: string;
  header: string;
  success: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // make this error when we need it
  if (!success) return null;

  return isOpen ? (
    <div className="flex bg-success-25 border-1px border-success-300 p-20px rounded-8px">
      <div className="mt-4px">
        <Checkmark />
      </div>
      <div className="text-success-700 ml-12px">
        <div className="font-bold">{header}</div>
        <div>{body}</div>
      </div>
      <div
        onClick={() => setIsOpen(false)}
        className="ml-auto text-success-500 cursor-pointer"
      >
        <X size={20} />
      </div>
    </div>
  ) : null;
};

export default Banner;
