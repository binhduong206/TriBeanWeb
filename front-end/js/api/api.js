const BASE_URL = "http://localhost:5262/api";

function isTokenExpired(bufferSeconds = 30) {
  const exp = localStorage.getItem("AccessTokenExp");
  if (!exp) return true;

  const expiryTime = new Date(exp).getTime();
  const now = Date.now();

  return expiryTime - now < bufferSeconds * 1000;
}

async function refreshToken() {
  const refreshToken = localStorage.getItem("RefreshToken");

  if (!refreshToken) return null;

  const res = await fetch(BASE_URL + "/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  localStorage.setItem("AccessToken", data.accessToken);
  localStorage.setItem("RefreshToken", data.refreshToken);
  localStorage.setItem("AccessTokenExp", data.expiration);

  return data.accessToken;
}

export async function request(url, options = {}) {
  let token = localStorage.getItem("AccessToken");

  if (token && isTokenExpired()) {
    const newToken = await refreshToken();

    if (!newToken) {
      logout();
      return;
    }

    token = newToken;
  }

  let res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    const newToken = await refreshToken();

    if (!newToken) {
      logout();
      return;
    }

    res = await fetch(BASE_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });
  }

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}
