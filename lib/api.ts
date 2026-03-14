import axios from "axios";

export const api = axios.create({
  baseURL: "https://gotogo-backend.onrender.com", // 👈 your backend IP
  timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
