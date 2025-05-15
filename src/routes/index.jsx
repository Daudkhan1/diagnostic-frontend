import { lazy } from "react";

export const Login = lazy(() => import("../pages/login"));

export const Register = lazy(() => import("../pages/register"));

export const ForgotPassword = lazy(() => import("../pages/forgotPassword"));

export const Dashboard = lazy(() => import("../pages/dashboard"));

export const UserManagement = lazy(() => import("../pages/userManagement"));

export const PathologyAnnotationTool = lazy(() =>
  import("../pages/pathologyTool/annotation")
);

export const PathologyCaseDetails = lazy(() =>
  import("../pages/pathologyTool/caseDetails")
);

export const PathologyEditor = lazy(() =>
  import("../pages/pathologyTool/editor")
);

export const RadiologyAnnotationTool = lazy(() =>
  import("../pages/radiologyTool/annotation")
);

export const RadiologyCaseDetails = lazy(() =>
  import("../pages/radiologyTool/caseDetails")
);

export const RadiologyEditor = lazy(() =>
  import("../pages/radiologyTool/editor")
);

export const Pathology = lazy(() => import("../pages/pathology"));

export const Radiology = lazy(() => import("../pages/radiology"));

export const PathologyScanDetails = lazy(() =>
  import("../pages/pathologyScanDetails")
);

export const RadiologyScanDetails = lazy(() =>
  import("../pages/radiologyScanDetails")
);

export const Settings = lazy(() => import("../pages/settings"));
