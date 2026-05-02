export function renderProductCard(product) {
  return `
      <div class="card">
        <div class="card__container" data-category="${product.categoryName}" data-price="${product.newPrice}" data-rating="${product.productName}">
          
          <div class="card__img">
            <a href="../../pages/productdetail.html?id=${product.id}">
                <img src="${product.mainImgUrl}" alt="" />
            </a>
          </div>

          <div class="card__content">

            <div class="card__header">
              <div class="card__category">
                <span>${product.categoryName}</span>
              </div>

              <div class="card__rating">
                <span>${product.rating}</span>
                <i class="fa-solid fa-star"></i>
              </div>
            </div>

            <div class="card__name">
              ${product.productName}
            </div>
            <div class="card__desc">${product.description}</div>

            <div class="card__footer">

              ${
                product.discount > 0
                  ? `
                  <div class="card__footer--left">
                    <div class="card__price--new">
                      $${product.newPrice}
                    </div>
                    <div class="card__price--old">
                      $${product.oldPrice}
                    </div>
                  </div>
                  `
                  : `
                  <div class="card__footer--left">
                    <div class="card__price">
                      $${product.price}
                    </div>
                  </div>
                  `
              }

              <div class="card__favorite">
                <i class="fa-regular fa-heart"></i>
              </div>

            </div>

          </div>
        </div>
      </div>
  `;
}
