import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "./api";

const TOKEN_KEY = "auth_token";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  setAuthToken(token);
};

export const loadToken = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
  return token;
};

export const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  setAuthToken("");
};
