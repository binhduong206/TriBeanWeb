import { request } from "./api";

export const requestLogin = (info) => request("auth/login");
