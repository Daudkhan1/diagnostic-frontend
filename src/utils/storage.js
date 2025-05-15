import { redirect } from "react-router-dom";

export function getUserData() {
  const storage = localStorage.getItem("praid-user");
  const storedUser = JSON.parse(storage);
  delete storedUser.token;

  return storedUser;
}

export function getToken() {
  const storage = localStorage.getItem("praid-user");
  const storedUser = JSON.parse(storage);

  return storedUser?.token;
}

export const isAuthenticated = async () => {
  const token = getToken();
  if (token) throw redirect("/dashboard");
  return null;
};
