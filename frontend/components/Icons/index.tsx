import { Check } from "react-feather";

export const Checkmark = ({
  color = "#00A577",
  className = "",
  style = {},
  size = 10,
  strokeWidth = 4,
}: {
  color?: string;
  className?: string;
  // eslint-disable-next-line
  style?: any;
  size?: number;
  strokeWidth?: number;
}) => {
  return (
    <div
      style={{ borderColor: color, ...style }}
      className={`border-1.5px rounded-full mr-8px border-primary-700 w-16px h-16px flex items-center justify-center ${className}`}
    >
      <Check color={color} size={size} strokeWidth={strokeWidth} />
    </div>
  );
};
