import { Suspense } from "react";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

import Loader from "./components/loader";
import {
  Login,
  Register,
  Dashboard,
  ForgotPassword,
  UserManagement,
  Pathology,
  PathologyScanDetails,
  Radiology,
  RadiologyScanDetails,
  PathologyAnnotationTool,
  PathologyCaseDetails,
  PathologyEditor,
  RadiologyAnnotationTool,
  RadiologyCaseDetails,
  RadiologyEditor,
  Settings,
} from "./routes";
import Protected from "./routes/protected";
import { isAuthenticated } from "./utils/storage";

import "./App.scss";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route
        index
        path="/"
        element={<Login />}
        loader={async () => await isAuthenticated()}
      />

      <Route
        path="signup"
        element={<Register />}
        loader={async () => await isAuthenticated()}
      />

      <Route
        path="forgot-password"
        element={<ForgotPassword />}
        loader={async () => await isAuthenticated()}
      />

      <Route element={<Protected />}>
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="users/pathology-technicians"
          element={<UserManagement />}
        />

        <Route
          path="users/radiology-technicians"
          element={<UserManagement />}
        />

        <Route path="users/pathologist" element={<UserManagement />} />

        <Route path="users/radiologist" element={<UserManagement />} />

        <Route
          path="pathology-annotation-tool"
          element={<PathologyAnnotationTool />}
        />

        <Route
          exact
          path="pathology-annotation-tool/:id/case-details"
          element={<PathologyCaseDetails />}
        />

        <Route
          exact
          path="/pathology-annotation-tool/:id/case-details/tool-editor"
          element={<PathologyEditor />}
        />

        <Route
          exact
          path="radiology-annotation-tool"
          element={<RadiologyAnnotationTool />}
        />

        <Route
          exact
          path="radiology-annotation-tool/:id/case-details"
          element={<RadiologyCaseDetails />}
        />

        <Route
          exact
          path="/radiology-annotation-tool/:id/case-details/tool-editor"
          element={<RadiologyEditor />}
        />

        <Route exact path="pathology" element={<Pathology />} />

        <Route
          exact
          path="pathology/scan-details/:id/case-details"
          element={<PathologyScanDetails />}
        />

        <Route exact path="radiology" element={<Radiology />} />

        <Route
          exact
          path="radiology/scan-details/:id/case-details"
          element={<RadiologyScanDetails />}
        />

        <Route exact path="settings" element={<Settings />} />
      </Route>

      {/* <Route path="*" element={<h1>Page not found</h1>} /> */}
    </Route>
  )
);

function App({ checked, authenticated }) {
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {checked && <RouterProvider router={router} />}
    </Suspense>
  );
}

const mapStateToProps = ({ session }) => ({
  checked: session.checked,
  authenticated: session.authenticated,
});

export default connect(mapStateToProps)(App);
