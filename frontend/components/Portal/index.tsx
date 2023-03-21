import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // @ts-ignore
    ref.current = document.querySelector("body");
    setMounted(true);
  }, [ref]);

  // @ts-ignore
  return mounted ? createPortal(children, ref.current) : null;
};
