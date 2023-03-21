import Image from "next/image";
import { useState } from "react";

interface AssetImageProps {
  src: string;
  alt: string;
  backup?: string;
}

const AssetImage = (props: AssetImageProps) => {
  const [src, setSrc] = useState(props.src);

  return (
    <div>
      <Image
        src={src}
        alt={props.alt}
        width="28"
        height="28"
        onError={() => {
          if (props.backup) setSrc(props.backup);
        }}
      />
    </div>
  );
};

export default AssetImage;
