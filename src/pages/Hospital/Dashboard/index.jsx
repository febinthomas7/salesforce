import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { hospitalData, doctorsData, reportsData } from "../../../utils";
import { Stethoscope, FileText } from "lucide-react";
import { Users, Building } from "lucide-react";
import { formatDate } from "../../../utils";

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState(doctorsData);
  const [hospital, setHospital] = useState(
    localStorage.getItem("hospitalName")
  );
  const reports = reportsData;

  const totalDoctors = doctors?.length || 0;
  const completedReports = reports?.filter(
    (report) => report.status === "Completed"
  );
  const totalReports = completedReports?.length || 0;
  const recentDoctorActivity = doctors?.slice(0, 4) || [];
  // --- Mock Data for Charts ---
  const activityData = [
    { name: "Mon", reports: 40 },
    { name: "Tue", reports: 30 },
    { name: "Wed", reports: 60 },
    { name: "Thu", reports: 45 },
    { name: "Fri", reports: 90 },
  ];

  const specialtyData = [
    { name: "Cardiology", value: 450 },
    { name: "Neurology", value: 320 },
    { name: "Pediatrics", value: 300 },
    { name: "Orthopedics", value: 280 },
    { name: "Dermatology", value: 210 },
    { name: "Oncology", value: 190 },
    { name: "Radiology", value: 250 },
    { name: "General Surgery", value: 310 },
  ];

  // Extended color palette to match your teal theme
  const COLORS = [
    "#0b4f4a", // Dark Teal
    "#1a756f", // Medium Teal
    "#2a9b94", // Light Teal
    "#3dbbb3", // Bright Teal
    "#7ccdc8", // Soft Teal
    "#a3dbd7", // Pale Teal
    "#d1e8e5", // Very Light Teal
    "#083a36", // Deep Forest Teal
  ];
  return (
    <div className="space-y-12 p-10 fade-in bg-gray-50">
      {/* --- Top Stats Cards --- */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-[#d1e8e5] hover:scale-105 transition-transform duration-300 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{totalDoctors}</p>
              <p className="text-white font-medium">Total Doctors</p>
            </div>
            <div className="bg-[#0b4f4a] p-4 rounded-xl shadow-md">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-[#d1e8e5] hover:scale-105 transition-transform duration-300 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{totalReports}</p>
              <p className="text-white font-medium">Reports Completed</p>
            </div>
            <div className="bg-[#0b4f4a] p-4 rounded-xl shadow-md">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#d1e8e5] to-white p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-[#d1e8e5] hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-[#0b4f4a]">{hospital}</p>
              <p className="text-[#0b4f4a] font-medium">Hospital Name</p>
            </div>
            <div className="bg-[#0b4f4a] p-4 rounded-xl shadow-md">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div> */}

      {/* --- NEW: Charts Row 1 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Report Volume Line Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#0b4f4a] mb-4">
            Report Activity (Weekly)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#1a756f"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Specialty Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#0b4f4a] mb-4">
            Specialty Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- NEW: Charts Row 2 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. Monthly Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#0b4f4a] mb-4">
            Growth Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#2a9b94" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Doctor Performance Radar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#0b4f4a] mb-4">
            Performance Metrics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={[
                  { subject: "Speed", A: 120, fullMark: 150 },
                  { subject: "Accuracy", A: 98, fullMark: 150 },
                  { subject: "Volume", A: 86, fullMark: 150 },
                  { subject: "Feedback", A: 99, fullMark: 150 },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  name="Hospital Avg"
                  dataKey="A"
                  stroke="#0b4f4a"
                  fill="#0b4f4a"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Recent Doctor Activity --- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-[#0b4f4a] mb-6 flex items-center">
          <Users className="h-6 w-6 text-[#1a756f] mr-3" />
          Recent Doctor Activity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentDoctorActivity.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:scale-105 hover:shadow-lg transition-transform duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-[#d1e8e5] p-3 rounded-full">
                  <Stethoscope className="h-5 w-5 text-[#0b4f4a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last logged in: {formatDate(doctor.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
