import "styles/globals.css";
import "./transactions/day-picker.css";

import { Web3ReactProvider } from "@web3-react/core";
import Modal from "components/Modal";
import NavBar from "components/NavBar";
import NavbarVertical from "components/NavBarVertical";
import SlideOut from "components/SlideOut";
import connectors from "constants/connectors";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useTransactions from "stores/transaction";
import useUserSettings from "stores/userSettings";
import { authGet } from "utils/fetch-wrapper";

interface PageProps extends AppProps {
  isAuthenticated: boolean;
  isSetup: boolean;
  shouldReset: boolean;
}

function MyApp({ Component, pageProps, isAuthenticated, isSetup }: PageProps) {
  const setSafes = useUserSettings((state) => state.setSafes);
  const setWalletNames = useUserSettings((state) => state.setWalletNames);
  const setCurrencies = useTransactions((state) => state.setCurrencies);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", `${isAuthenticated}`);
    localStorage.setItem("isSetup", `${isSetup}`);

    if (!isAuthenticated && !window.location.href.includes("login")) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isSetup]);

  useEffect(() => {
    authGet({ url: "gnosis-safe" }).then(({ safes }) => {
      setSafes(safes);
    });

    authGet({ url: "filters/currencies" }).then(({ currencies }) => {
      setCurrencies(currencies);
    });

    authGet({ url: "user/info" }).then((response) => {
      if (response.success) {
        setWalletNames(response.wallets);
      }
    });
  }, [setCurrencies, setWalletNames, setSafes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Web3ReactProvider connectors={connectors}>
        <div
          // style={{ backgroundColor: isSetup ? "#f9fafb" : "white" }}
          className={`flex flex-row w-full h-full h-screen`}
        >
          <title>Base58</title>
          <SlideOut />
          {isAuthenticated && isSetup && <NavbarVertical />}
          <div className="w-full">
            <Modal />

            {isAuthenticated && <NavBar isSetup={isSetup} />}
            <Component {...pageProps} />
          </div>
        </div>
      </Web3ReactProvider>
    </DndProvider>
  );
}

// @ts-ignore
MyApp.getInitialProps = async ({ ctx }) => {
  const pingUrl = `auth/ping`;

  if (ctx.req) {
    const jwt = ctx.req.cookies.jwt;
    const { isAuthenticated, isSetup } = await authGet({
      url: pingUrl,
      jwtAccessToken: jwt,
    });

    return { isAuthenticated, isSetup };
  } else {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const isSetup = localStorage.getItem("isSetup");

    return { isAuthenticated: isAuthenticated, isSetup };
  }
};

export default MyApp;
