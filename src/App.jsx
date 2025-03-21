import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkSession, logout } from "./redux/authSlice";
import {
  LoginPage,
  AdminUpdatePage,
  AdminHomePage,
  KAPEmployeeHomePage,
  GovernmentEmployeeHomePage,
  CompanyEmployeeHomePage,
  IntegrationEmployeeHomePage,
  // ##################
  AddKapCompanyPage,
  AddGovSectorPage,
  AddOperatingCompanyPage,
  // #################
  ManageEmployeePage,
  AddKapEmloyeePage,
  AddGovManagerPage,
  AddCompanyManagerPage,
} from "./pages";
import Header from "./components/Header";

/* Protected Route */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, status } = useSelector((state) => state.auth);

  // Show loading screen while checking session
  if (status === "loading") return <div>Loading...</div>;

  // Redirect to login if no user
  if (!user) return <Navigate to="/login" />;

  // Check if user role is allowed
  return allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

/* App Component */
const App = () => {
  const dispatch = useDispatch();

  // Check session when app loads
  // useEffect(() => {
  //   dispatch(checkSession())
  //     .unwrap()
  //     .catch(() => {
  //       // dispatch(logout()); // Auto logout if session is invalid
  //     });
  // }, [dispatch]);

  return (
    <div className="h-svh  bg-gray-100">
      <Router>
        <div className="flex flex-col align-middle">
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
                path="//add-companyManager"
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
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
};

export default App;
