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
  GovSectorManagerHomePage,
  OperatingManagerHomePage,
  // ####################
  AddKapCompanyPage,
  AddGovSectorPage,
  AddOperatingCompanyPage,
  ManageEmployeePage,
  AddKapEmloyeePage,
  AddGovManagerPage,
  AddCompanyManagerPage,
} from "./pages";
import Header from "./components/Header";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const user =
    useSelector((state) => state.auth.data) ||
    JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/admin-update" replace />;

  return children;
};

const App = () => {
  const user =
    useSelector((state) => state.auth.data) ||
    JSON.parse(localStorage.getItem("user"));

  return (
    <div className="h-screen bg-gray-100">
      <Router>
        <div className="flex flex-col align-middle">
          <Header />
          <div className="flex-grow p-1">
            <Routes>
              <Route
                path="/login"
                element={
                  user ? <Navigate to="/admin-update" replace /> : <LoginPage />
                }
              />

              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/admin-update" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/admin-update"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                      "op_manager",
                      "gov_manager",
                      "kap_employee",
                    ]}
                  >
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
                path="/add-kapCompany"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddKapCompanyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-govSector"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddGovSectorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-operatingCompany"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddOperatingCompanyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-employees"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageEmployeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-kapEmployee"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddKapEmloyeePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-govManager"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddGovManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-companyManager"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddCompanyManagerPage />
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

              <Route
                path="/govsector-manager-home"
                element={
                  <ProtectedRoute allowedRoles={["gov_manager"]}>
                    <GovSectorManagerHomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/op-manager-home"
                element={
                  <ProtectedRoute allowedRoles={["op_manager"]}>
                    <OperatingManagerHomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  user ? (
                    <Navigate to="/admin-update" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
};

export default App;
