export const ratingLabels = [
  "Basic",
  "Intermediate",
  "Challenging",
  "Complex",
  "Expert",
];

export const hideFields = ["RADIOLOGIST"];

export const ratingDescriptions = [
  "Straightforward and simple cases",
  "Requires some analysis but manageable",
  "Needs careful consideration and effort.",
  "Involves multiple factors and deep analysis.",
  "Highly intricate, requiring deep expertise",
];

export const getMainContent = (currentCase) => {
  switch (currentCase) {
    case 0:
      return {
        heading: "Add your Diagnosis",
        caption: "Please enter your diagnosis Details",
      };
    case 1:
      return {
        heading: "Case feedback",
        caption: "Please rate the difficulty of this case",
      };
    case 2:
      return {
        heading: "Transfer Case to",
        caption: "Select a pathologist to transfer this case to",
      };
    default:
      return {
        heading: "",
        caption: "",
      };
  }
};
