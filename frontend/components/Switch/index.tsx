import { useState } from "react";

const Switch = ({ onClick }: { onClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => {
        setIsOpen(!isOpen);
        onClick();
      }}
      className={`w-36px h-20px ${
        isOpen ? "bg-primary-500" : "bg-gray-100"
      } rounded-12px flex items-center cursor-pointer relative`}
    >
      <div
        className={`w-16px h-16px bg-white rounded-full absolute ${
          isOpen ? "right-2px" : "left-2px"
        }`}
      ></div>
    </div>
  );
};

export default Switch;
