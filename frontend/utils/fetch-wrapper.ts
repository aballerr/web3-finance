import { BASE_URL } from "constants/url";
import Cookies from "js-cookie";

interface PostParams {
  url: string;
  body: string;
}

interface DeleteParams {
  url: string;
  body?: string;
}

export const authPost = ({ url, body }: PostParams) => {
  const jwt = Cookies.get("jwt");

  return fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    credentials: "include",
    // @ts-ignore
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      Authorization: `Bearer ${jwt}`,
    },
    body,
  }).then((res) => res.json());
};

export const authUpload = ({ url, body }: { url: string; body: FormData }) => {
  const jwt = Cookies.get("jwt");

  return fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    credentials: "include",
    // @ts-ignore
    headers: {
      Accept: "*/*",
      "Access-Control-Allow-Credentials": true,
      Authorization: `Bearer ${jwt}`,
    },
    body,
  }).then((res) => res.json());
};

export const authPut = ({ url, body }: PostParams) => {
  const jwt = Cookies.get("jwt");

  return fetch(`${BASE_URL}/${url}`, {
    method: "PUT",
    credentials: "include",
    // @ts-ignore
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      Authorization: `Bearer ${jwt}`,
    },
    body,
  }).then((res) => res.json());
};

export const authDelete = ({ url, body = "{}" }: DeleteParams) => {
  const jwt = Cookies.get("jwt");

  return fetch(`${BASE_URL}/${url}`, {
    method: "DELETE",
    credentials: "include",
    // @ts-ignore
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      Authorization: `Bearer ${jwt}`,
    },
    body,
  }).then((res) => res.json());
};

interface GetParams {
  url: string;
  signal?: AbortSignal;
  jwtAccessToken?: string;
}

export const authGet = (params: GetParams) => {
  const { url, jwtAccessToken } = params;
  const jwt = jwtAccessToken ?? Cookies.get("jwt");

  return fetch(`${BASE_URL}/${url}`, {
    method: "GET",
    credentials: "include",
    // @ts-ignore
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      Authorization: `Bearer ${jwt}`,
    },
  }).then((res) => res.json());
};
