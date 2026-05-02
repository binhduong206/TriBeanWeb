export const authStore = {
  accessToken: localStorage.getItem("AccessToken"),
  refreshToken: localStorage.getItem("RefreshToken"),
  accessTokenExp: localStorage.getItem("AccessTokenExpiration"),
  refreshTokenExp: localStorage.getItem("RefreshTokenExpiration"),
  user: JSON.parse(localStorage.getItem("UserInfo") || "null"),
};
