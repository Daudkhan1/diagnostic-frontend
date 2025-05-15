import axios from "axios";
import {BASE_URL} from "../constants";

let store;

export const injectStore = (_store) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: " application/json",
  },
});

const handleNotAuthenticated = () => {
  localStorage.removeItem("praid-user");
  window.location = "/";
};

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.authorization = `Bearer ${
      store.getState().session.user.token
    }`;

    if (config.customHeaders) {
      Object.keys(config.customHeaders).forEach((key) => {
        config.headers[key] = config.customHeaders[key];
      });

      delete config.customHeaders;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      handleNotAuthenticated();
    }
    return Promise.reject(error);
  }
);

const httpService = {
  create: axios.create,
  get: axiosInstance.get,
  post: axiosInstance.post,
  put: axiosInstance.put,
  delete: axiosInstance.delete,
  patch: axiosInstance.patch,
};

export default httpService;
