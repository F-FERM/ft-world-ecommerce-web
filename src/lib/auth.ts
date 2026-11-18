import { TOKEN_KEYS } from "../utility/localStorage";

export const logout = () => {
  localStorage.removeItem(TOKEN_KEYS.admin);
  window.location.href = "/admin/login/";
};