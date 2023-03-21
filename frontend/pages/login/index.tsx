import Base58Logo from "components/Base58Logo";
import { BASE_URL } from "constants/url";
import Cookies from "js-cookie";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import BeatLoader from "react-spinners/BeatLoader";
import useUserSettings from "stores/userSettings";
import { getTransition } from "utils/styles";

const signInHoverIn = getTransition("hover:bg-primary-700 ");

const Login: NextPage = () => {
  const clientId = "";
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [email, setEmail] = useState("");
  const [apiloaded, setapiloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setUserInfo = useUserSettings((state) => state.setUserInfo);

  const loadGapi = async () => {
    const gapi = await import("gapi-script").then((pack) => pack.gapi);
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: "",
      });
    };
    gapi.load("client:auth2", initClient);
    setapiloaded(true);
  };

  useEffect(() => {
    loadGapi();
  });

  const sendCode = () => {
    const data = { email };
    setIsLoading(true);

    fetch(`${BASE_URL}/auth/email/createcode`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    })
      .then(() => {
        setIsLoading(false);
        setCodeSent(true);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const verifyCode = () => {
    const data = { code, email };

    fetch(`${BASE_URL}/auth/email/checkcode`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          Cookies.set("jwt", response.token);
          localStorage.setItem("lastLogin", new Date().toString());
          const { email, wallets } = response;
          setUserInfo(email, "", wallets);

          window.location.href = "/";
        }
      });
  };

  const googleAuth = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    // @ts-ignore
    const data = { access_token: response.accessToken };

    try {
      fetch(`${BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((response) => {
          Cookies.set("jwt", response.token);
          localStorage.setItem("lastLogin", new Date().toString());

          const { email = "", picture = "", wallets = [] } = response;
          setUserInfo(email, picture, wallets);

          if (response.setup == false) {
            window.location.href = "/safes";
          } else {
            window.location.href = "/";
          }
        });
    } catch (err) {
      console.log(err);
      console.log("fetch request failed");
    }
  };

  return (
    <div className="grid grid-cols-2">
      <div
        style={{
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="pt-36px pl-32px"
      >
        <Base58Logo />
      </div>
      <div
        style={{
          height: "100vh",
        }}
        className="flex bg-white justify-center items-center"
      >
        {codeSent ? (
          <div className="flex flex-col">
            <div className="text-30px text-gray-900 font-Medium">
              Welcome to Base58
            </div>
            <div className="text-gray-600 mt-12px">
              One place to manage all your on-chain finance.
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="code"
              className="py-8px px-12px border-1px outline-none  mt-32px "
            />
            <button
              className={`bg-primary-600 ${signInHoverIn} rounded-6px py-10px mt-32px px-112px text-white`}
              onClick={verifyCode}
            >
              Submit Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="text-30px text-gray-900 font-Medium">
              Welcome to Base58
            </div>
            <div className="text-gray-600 mt-12px">
              One place to manage all your on-chain finance.
            </div>
            {/* <button
              className={`text-16px border-1px text-gray-700 font-semibold mt-32px py-10px px-90px flex items-center justify-center rounded-6px ${hoverIn}`}
              onClick={google}
            >
              <Image src={googleIcon} alt="google icon" />
              <span className="ml-8px"> Sign in with Google</span>
            </button> */}
            {apiloaded && (
              <div className="mt-32px ">
                <GoogleLogin
                  buttonText="Sign in with google"
                  clientId="1062323017845-n51f43jng2anrcm1m6vmisrnfo197k8g.apps.googleusercontent.com"
                  onSuccess={googleAuth}
                  onFailure={(err) => {
                    console.log("google auth failed");
                    console.log(err);
                  }}
                  className="w-full text-center flex justify-center"
                />
              </div>
            )}

            <div className="my-32px flex items-center">
              <span
                style={{ width: "50%" }}
                className="h-px bg-gray-200"
              ></span>
              <div className="text-gray-600 mx-8px">OR</div>
              <span
                className="h-px bg-gray-200"
                style={{ width: "50%" }}
              ></span>
            </div>
            <input
              className="py-8px px-12px border-1px outline-none"
              placeholder="Enter your company email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isLoading ? (
              <div className="flex align-center">
                <BeatLoader
                  className="ml-auto mr-auto mt-16px"
                  color="#00CF9D"
                />{" "}
              </div>
            ) : (
              <button
                className={`bg-primary-600 ${signInHoverIn} rounded-6px py-10px mt-32px px-112px text-white`}
                onClick={sendCode}
              >
                Sign in with email
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
