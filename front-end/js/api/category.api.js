import { request } from "./api.js";

export const getCategoryQuantity = () => request("/categories");
