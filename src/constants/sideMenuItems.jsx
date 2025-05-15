import {
  DashboardIcon,
  PathologyToolIcon,
  RadiologyToolIcon,
  RadiologyIcon,
  UserManagementIcon,
  SettingsIcon,
} from "@/assets/svg";

const pathologyToolRoles = ["ADMIN", "PATHOLOGIST"];
const radiologyToolRoles = ["ADMIN", "RADIOLOGIST"];
const pathologyTechnicianRoles = ["ADMIN", "PATHOLOGIST_TECHNICIAN"];
const radiologyTechnicianRoles = ["ADMIN", "RADIOLOGIST_TECHNICIAN"];

const sideMenuItems = (role) => {
  return [
    {
      key: "dashboard",
      icon: <DashboardIcon />,
      label: "Dashboard",
    },
    pathologyToolRoles.includes(role) && {
      key: "pathology-annotation-tool",
      icon: <PathologyToolIcon />,
      label: "Pathology Tool",
    },
    radiologyToolRoles.includes(role) && {
      key: "radiology-annotation-tool",
      icon: <RadiologyToolIcon />,
      label: "Radiology Tool",
    },

    pathologyTechnicianRoles.includes(role) && {
      key: "pathology",
      icon: <RadiologyIcon />,
      label: "Pathology",
    },
    radiologyTechnicianRoles.includes(role) && {
      key: "radiology",
      icon: <RadiologyIcon />,
      label: "Radiology",
    },
    role === "ADMIN" && {
      key: "user-management",
      icon: <UserManagementIcon />,
      label: "User Management",
      children: [
        {
          key: "users/pathology-technicians",
          icon: <UserManagementIcon />,
          label: "Pathology Technicians",
        },
        {
          key: "users/radiology-technicians",
          icon: <UserManagementIcon />,
          label: "Radiology Technicians",
        },
        {
          key: "users/pathologist",
          icon: <UserManagementIcon />,
          label: "Pathologist",
        },
        {
          key: "users/radiologist",
          icon: <UserManagementIcon />,
          label: "Radiologist",
        },
      ],
    },
    role === "ADMIN" && {
      key: "settings",
      icon: <SettingsIcon />,
      label: "Settings",
      // disabled: true,
    },
  ];
};

export default sideMenuItems;
