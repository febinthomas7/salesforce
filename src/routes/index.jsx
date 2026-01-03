import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { PrivateRoute, PublicRoute } from "../utils"; // ⬅️ import it

import Contact from "../pages/ContactUs";
import About from "../pages/AboutUs";
import Service from "../pages/Services";
import PrivacyPolicy from "../pages/Privacy";
import TermsOfService from "../pages/Terms";
import Layout from "../components/Layout/index.jsx";
import MedicalHistory from "../pages/Patient/Dashboard/MedicalHistory.jsx";
import AppointmentBooking from "../pages/Patient/Dashboard/AppointmentBooking.jsx";
import ReportUpload from "../pages/Doctor/Dashboard/ReportUpload.jsx";
import AssignReport from "../pages/Doctor/Dashboard/AssignReport.jsx";
import {
  doctorNavigation,
  hospitalNavigation,
  patientNavigation,
} from "../utils/navigaion.js";
import DoctorsSection from "../pages/Hospital/Dashboard/DoctorSection.jsx";
import ReportsSection from "../pages/Hospital/Dashboard/ReportSection.jsx";
import ProfileSection from "../pages/Hospital/Dashboard/ProfileSection.jsx";

const Home = lazy(() => import("../pages/Home"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PatientDashboard = lazy(() => import("../pages/Patient/Dashboard"));
const DoctorDashboard = lazy(() => import("../pages/Doctor/Dashboard"));
const AdminDashboard = lazy(() => import("../pages/Admin/adminPortal.jsx"));
const HospitalDashboard = lazy(() =>
  import("../pages/Hospital/Dashboard/index")
);

const LoginPatient = lazy(() => import("../pages/Patient/Login"));
const LoginHospital = lazy(() => import("../pages/Hospital/Login"));
const LoginA = lazy(() => import("../login/aiAssistent"));
const LoginDoctor = lazy(() => import("../pages/Doctor/Login"));
const HospitalHomePage = lazy(() => import("../pages/Hospital/Home"));
const doctor = "Doctor";
const patient = "Patient";
const hospital = "Hospital";
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/patient/dashboard",
    element: (
      <PrivateRoute allowedRoles={["patient"]} redirectTo="/login/patient">
        <Layout navigation={patientNavigation} name={patient}>
          <PatientDashboard />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/patient/report",
    element: (
      <PrivateRoute allowedRoles={["patient"]} redirectTo="/login/patient">
        <Layout navigation={patientNavigation} name={patient}>
          <MedicalHistory />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/patient/appointment-booking",
    element: (
      <PrivateRoute allowedRoles={["patient"]} redirectTo="/login/patient">
        <Layout navigation={patientNavigation} name={patient}>
          <AppointmentBooking />
        </Layout>
      </PrivateRoute>
    ),
  },

  {
    path: "/doctor/dashboard",
    element: (
      <PrivateRoute allowedRoles={["doctor"]} redirectTo="/login/doctor">
        <Layout navigation={doctorNavigation} name={doctor}>
          {" "}
          <DoctorDashboard />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/doctor/report-upload",
    element: (
      <PrivateRoute allowedRoles={["doctor"]} redirectTo="/login/doctor">
        <Layout navigation={doctorNavigation} name={doctor}>
          {" "}
          <ReportUpload />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/doctor/assign-report",
    element: (
      <PrivateRoute allowedRoles={["doctor"]} redirectTo="/login/doctor">
        <Layout navigation={doctorNavigation} name={doctor}>
          {" "}
          <AssignReport />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/hospital/dashboard",
    element: (
      <PrivateRoute allowedRoles={["hospital"]} redirectTo="/login/hospital">
        <Layout navigation={hospitalNavigation} name={hospital}>
          <HospitalDashboard />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/hospital/doctor-form",
    element: (
      <PrivateRoute allowedRoles={["hospital"]} redirectTo="/login/hospital">
        <Layout navigation={hospitalNavigation} name={hospital}>
          <DoctorsSection />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/hospital/reports",
    element: (
      <PrivateRoute allowedRoles={["hospital"]} redirectTo="/login/hospital">
        <Layout navigation={hospitalNavigation} name={hospital}>
          <ReportsSection />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: "/hospital/profile",
    element: (
      <PrivateRoute allowedRoles={["hospital"]} redirectTo="/login/hospital">
        <Layout navigation={hospitalNavigation} name={hospital}>
          <ProfileSection />
        </Layout>
      </PrivateRoute>
    ),
  },
  { path: "/contact", element: <Contact /> },
  { path: "/about", element: <About /> },
  { path: "/services", element: <Service /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  {
    path: "/login/patient",
    element: (
      <PublicRoute>
        <LoginPatient />
      </PublicRoute>
    ),
  },
  {
    path: "/login/hospital",
    element: (
      <PublicRoute>
        <LoginHospital />{" "}
      </PublicRoute>
    ),
  },
  { path: "/logina", element: <LoginA /> },
  {
    path: "/login/doctor",
    element: (
      <PublicRoute>
        <LoginDoctor />
      </PublicRoute>
    ),
  },
  {
    path: "/hospital",
    element: (
      <PublicRoute>
        <HospitalHomePage />
      </PublicRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
