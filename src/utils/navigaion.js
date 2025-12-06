import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { User, Users, LayoutDashboard, Building2 } from "lucide-react";

export const patientNavigation = [
  { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/patient/report", icon: DocumentTextIcon },
  {
    name: "Appointment",
    href: "/patient/appointment-booking",
    icon: MagnifyingGlassIcon,
  },
];

export const doctorNavigation = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/doctor/report-upload", icon: DocumentTextIcon },
  { name: "Assign", href: "/doctor/assign-report", icon: User },
];

export const hospitalNavigation = [
  { name: "Dashboard", href: "/hospital/dashboard", icon: LayoutDashboard },
  { name: "Doctors", href: "/hospital/doctor-form", icon: Users },
  { name: "Profile", href: "/hospital/profile", icon: Building2 },
  { name: "Reports", href: "/hospital/reports", icon: DocumentTextIcon },
];
