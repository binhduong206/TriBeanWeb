import { request } from "./api.js";

// export const getAllProduct = (pageNumber) =>
//   request(`/products/?pageNumber=${pageNumber}`);

// export const getAllProductByCategoryName = (categoryName, pageNumber) =>
//   request(`/products/?categoryName=${categoryName}&pageNumber=${pageNumber}`); // return data

// export const getAllProductByProductName = (productName) =>
//   request(`/products/?productName=${productName}`);

export const getProducts = (state) => {
  const param = new URLSearchParams();

  param.append("pageNumber", state.pageNumber);
  param.append("pageSize", state.pageSize);

  if (state.search) {
    param.append("productName", state.search);
  }

  if (state.categoryName !== "all") {
    param.append("categoryName", state.categoryName);
  }

  if (state.price !== 0) {
    param.append("price", state.price);
  }

  if (state.sort !== "default") {
    param.append("sortBy", state.sort);
  }

  return request(`/products?${param}`);
};

export const getProductDetail = (id) => {
  return request(`/products/${id}`);
};
