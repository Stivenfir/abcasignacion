export const tokenKey = "token";

export function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
}

export function isAuthed() {
  return !!getToken();
}
