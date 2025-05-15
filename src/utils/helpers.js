export const getUserNameInitials = (name) => {
  if (!name?.trim()) return "N/A";
  const portions = name
    ?.trim()
    .split(" ")
    ?.map((val) => val[0]);

  return portions
    ?.slice(0, 2)
    ?.reduce((a, b) => a + b, "")
    ?.toUpperCase();
};

export const getDashboardName = (name) => {
  let firstName = name?.split(" ")[0];

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

export const capitalizeValue = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const genericError = (error) => {
  if ((error = "Request failed with status code 500")) {
    return "Something went wrong!";
  }

  return error;
};
