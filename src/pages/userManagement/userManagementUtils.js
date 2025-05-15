export const getUserRole = (location) => {
  const page = location?.pathname?.split("/")?.[2];

  switch (page) {
    case "pathologist":
      return "PATHOLOGIST";
    case "pathology-technicians":
      return "PATHOLOGIST_TECHNICIAN";
    case "radiology-technicians":
      return "RADIOLOGIST_TECHNICIAN";
    case "radiologist":
      return "RADIOLOGIST";
    default:
      return "";
  }
};

export const updateStatus = (status) =>
  status === "ACTIVE" ? "INACTIVATE" : "ACTIVATE";
