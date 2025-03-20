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
  AddKapPage,
} from "./pages";
import Header from "./components/Header";

/* Protected Route */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  return allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

/* App Component */
const App = () => {
  return (
    <Router>
      <div className="flex flex-col">
        <Header />

        <div className="flex-grow p-1 ">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin-update"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUpdatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-home"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-kap"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddKapPage />
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
        </div>
      </div>
    </Router>
  );
};

export default App;
