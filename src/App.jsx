import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  LoginPage,
  AdminUpdatePage,
  AdminHomePage,
  KAPEmployeeHomePage,
  GovernmentEmployeeHomePage,
  CompanyEmployeeHomePage,
  IntegrationEmployeeHomePage,
} from "./pages";

/* ---------------------------------------------
   Role-Based Protected Route Component
--------------------------------------------- */
const ProtectedRoute = ({ role, allowedRoles, children }) => {
  return allowedRoles.includes(role) ? children : <Navigate to="/login" />;
};

const App = () => {
  // This will later be replaced by Redux
  const [role, setRole] = useState("admin");

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage setRole={setRole} />} />

        {/* Role-Based Protected Routes */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute role={role} allowedRoles={["admin"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-update"
          element={
            <ProtectedRoute role={role} allowedRoles={["admin"]}>
              <AdminUpdatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kap-employee-home"
          element={
            <ProtectedRoute role={role} allowedRoles={["kap_employee"]}>
              <KAPEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government-employee-home"
          element={
            <ProtectedRoute role={role} allowedRoles={["government_employee"]}>
              <GovernmentEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-employee-home"
          element={
            <ProtectedRoute role={role} allowedRoles={["company_employee"]}>
              <CompanyEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integration-employee-home"
          element={
            <ProtectedRoute role={role} allowedRoles={["integration_employee"]}>
              <IntegrationEmployeeHomePage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect: If no valid role, go to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
