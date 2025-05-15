export const pathologyOrganOption = [
  { value: "breast", label: "Breast" },
  { value: "prostate", label: "Prostate" },
  {
    value: "colon",
    label: "Colon",
  },
];

export const radiologyOrganOption = [
  { value: "Chest Xray", label: "chest-Xray" },
];

export const customOrganOption = { value: "new_organ", label: "Enter New Organ" };
// export const getMainContent = (currentCase, caseType) => {
//   switch (currentCase) {
//     case 0:
//       return {
//         heading: "MRN Detail",
//         caption: "Please provide your detail",
//       };
//     case 1:
//       return {
//         heading: "Case Details",
//         // caption: "Please enter Patient details",
//       };
//     default:
//       return {
//         heading: caseType === "PATHOLOGY" ? "Slide Details" : "Scan Details",
//         caption:
//           caseType === "PATHOLOGY"
//             ? "Please enter Slide details"
//             : "Please enter Scan details",
//       };
//   }
// };
