import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  User,
  Users,
  LayoutDashboard,
  Building2,
  Stethoscope,
  Calendar,
  Activity,
} from "lucide-react";

export const patientNavigation = [
  { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/patient/report", icon: DocumentTextIcon },
  {
    name: "Appointment",
    href: "/patient/appointment-booking",
    icon: MagnifyingGlassIcon,
  },
  { name: "My-Appointment", href: "/patient/my-appointment", icon: Calendar },
];

export const doctorNavigation = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/doctor/report-upload", icon: DocumentTextIcon },
  { name: "Assign", href: "/doctor/assign-report", icon: User },
];

export const receptionistNavigation = [
  { name: "Dashboard", href: "/receptionist/dashboard", icon: Activity },
  // {
  //   name: "Appointment",
  //   href: "/receptionist/appointment",
  //   icon: Calendar,
  // },
  // { name: "Doctor", href: "/receptionist/doctor", icon: Stethoscope },
  // { name: "Patient", href: "/receptionist/patient", icon: Users },
];

export const hospitalNavigation = [
  { name: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
  { name: "Doctors", href: "/hospital/doctor-form", icon: Users },
  { name: "Profile", href: "/hospital/profile", icon: Building2 },
  { name: "Reports", href: "/hospital/reports", icon: DocumentTextIcon },
];
