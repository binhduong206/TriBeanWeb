import * as homeProduct from "../api/homeproduct.api.js";
import * as menuProduct from "../api/product.api.js";

const fetchData = (data) => {
  return data.map((p) => ({
    id: p.id,
    productName: p.productName,
    categoryName: p.categoryName,
    discount: p.discount,
    price: p.price,
    oldPrice: p.price,
    description: p.description,
    newPrice:
      p.discount > 0
        ? Math.round((p.price - (p.price * p.discount) / 100) * 100) / 100
        : p.price,
    mainImgUrl: p.mainImgUrl,
    rating: p.rating,
  }));
};

const formatProductDetail = (p) => ({
  id: p.id,
  productName: p.productName,
  categoryName: p.categoryName,
  discount: p.discount,
  price: p.price,
  oldPrice: p.price,
  description: p.description,
  newPrice:
    p.discount > 0
      ? Math.round((p.price - (p.price * p.discount) / 100) * 100) / 100
      : p.price,
  mainImgUrl: p.mainImgUrl,
  rating: p.rating,
  reviewQuantity: p.reviewCount,
  quantitySold: p.quantitySold,
});

export async function fetchHomeProducts() {
  const data = await homeProduct.getBestSellerProducts();

  return fetchData(data);
}

export async function fetchMenuProducts(state) {
  const data = await menuProduct.getProducts(state);

  return fetchData(data);
}

export async function fetchProductDetail(id) {
  const data = await menuProduct.getProductDetail(id);
  return formatProductDetail(data);
}
