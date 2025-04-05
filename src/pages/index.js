// ======================
// Authentication Pages
// ======================
import LoginPage from "./Auth/Login";
import AdminUpdatePage from "./Auth/AdminUpdatePage";

// ======================
// Home/Dashboard Pages
// ======================
import AdminHomePage from "./Home/Admin";
import KAPEmployeeHomePage from "./Home/KapEmployee";
import CompanyEmployeeHomePage from "./Home/CompanyEmployee";
import IntegrationEmployeeHomePage from "./Home/IntegrationEmployee";
import OperatingManagerHomePage from "./Home/OperatingManager.jsx";
import GovSectorManagerHomePage from "./Home/GovSectorManager.jsx";
import OperatingEmployeeHomePage from "./Home/OperatingEmployee.jsx";
import GovEmployeeHomePage from "./Home/GovEmployee.jsx";

// ======================
// Admin Management Pages
// ======================
import AddKapCompanyPage from "./Admin/AddkapCompany";
import AddGovSectorPage from "./Admin/AddGovernment";
import AddOperatingCompanyPage from "./Admin/AddOperatingCompanies";
import ManageEmployeePage from "./Admin/ManageEmployee";
import AddKapEmloyeePage from "./Admin/KapEmployee";
import AddGovManagerPage from "./Admin/GovSectorManager";
import AddCompanyManagerPage from "./Admin/CompanyManager.jsx";

// ======================
// Operational Pages
// ======================
import AddCompanyEmployeePage from "./OperatingManagers/OpEmployee.jsx";
import AddGovEmployeePage from "./GovernmentManager/GovEmployee.jsx";
import ManageOpTicketsPage from "./OperatingManagers/opTickets.jsx";
import ManageKapTicketPage from "./kapEmployee/KapTicket.jsx";
import ManageTicketsEmployeePage from "./OpEmployee/ManageTicket.jsx";
import ManageTicketsGovPage from "./GovernmentManager/govTickets.jsx";
import ManageGovTicketsEmployeePage from "./GovEmployee/ManageTicket.jsx";

// ======================
// Export All Components
// ======================
export {
  // Authentication
  LoginPage,
  AdminUpdatePage,

  // Home/Dashboard
  AdminHomePage,
  KAPEmployeeHomePage,
  CompanyEmployeeHomePage,
  IntegrationEmployeeHomePage,
  OperatingManagerHomePage,
  GovSectorManagerHomePage,
  OperatingEmployeeHomePage,
  GovEmployeeHomePage,

  // Admin Management
  AddKapCompanyPage,
  AddGovSectorPage,
  AddOperatingCompanyPage,
  ManageEmployeePage,
  AddKapEmloyeePage,
  AddGovManagerPage,
  AddCompanyManagerPage,

  // Operational
  AddCompanyEmployeePage,
  AddGovEmployeePage,
  ManageOpTicketsPage,
  ManageKapTicketPage,
  ManageTicketsEmployeePage,
  ManageTicketsGovPage,
  ManageGovTicketsEmployeePage,
};
