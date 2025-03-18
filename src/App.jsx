import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LoginPage,
  AdminUpdatePage,
  AdminHomePage,
  KAPEmployeeHomePage,
  GovernmentEmployeeHomePage,
  CompanyEmployeeHomePage,
  IntegrationEmployeeHomePage,
} from "./pages";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  return allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-update"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUpdatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kap-employee-home"
          element={
            <ProtectedRoute allowedRoles={["kap_employee"]}>
              <KAPEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/government-employee-home"
          element={
            <ProtectedRoute allowedRoles={["government_employee"]}>
              <GovernmentEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-employee-home"
          element={
            <ProtectedRoute allowedRoles={["company_employee"]}>
              <CompanyEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integration-employee-home"
          element={
            <ProtectedRoute allowedRoles={["integration_employee"]}>
              <IntegrationEmployeeHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
