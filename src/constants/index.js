export const APP_URL = "";
// export const BASE_URL = "http://3.13.162.31:8000/";
// export const BASE_URL = "";
export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

//for image previews
export const CANTALOUPE_SERVER = import.meta.env.VITE_CANTALOUPE_SERVER;

// export const PRAID_USER = "praid-user";

//size in bytes
export const RADIOLOGY_MAX_FILE_SIZE = 25000000; //25MB

export const USER_MANAGEMENT_PATHS = [
  "users/pathology-technicians",
  "users/radiology-technicians",
  "users/pathologist",
  "users/radiologist",
];

export const organColorMap = {
  breast: 0,
  liver: 1,
  prostate: 2,
  kidney: 3,
  colon: 4,
};
