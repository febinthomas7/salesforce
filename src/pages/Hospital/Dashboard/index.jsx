import { useState } from "react";

import { hospitalData, doctorsData, reportsData } from "../../../utils";
import { Stethoscope, FileText } from "lucide-react";
import { Users, Building } from "lucide-react";
import { formatDate } from "../../../utils";

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState(doctorsData);
  const [hospital, setHospital] = useState(hospitalData);
  const reports = reportsData;

  const totalDoctors = doctors?.length || 0;
  const completedReports = reports?.filter(
    (report) => report.status === "Completed"
  );
  const totalReports = completedReports?.length || 0;
  const recentDoctorActivity = doctors?.slice(0, 4) || [];

  return (
    <div className="space-y-12 p-10 fade-in">
      {/* --- Top Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <p className="text-4xl font-bold text-[#0b4f4a]">
                {hospital.name}
              </p>
              <p className="text-[#0b4f4a] font-medium">Hospital Name</p>
            </div>
            <div className="bg-[#0b4f4a] p-4 rounded-xl shadow-md">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Recent Doctor Activity --- */}
      <div className="bg-[var(--color-card-bg)] p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-[var(--color-border)]">
        <h2 className="text-2xl font-bold text-[var(--color-card-text)] mb-6 flex items-center">
          <Users className="h-6 w-6 text-[var(--color-primary)] mr-3" />
          Recent Doctor Activity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentDoctorActivity.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-gray-200 hover:scale-105 hover:shadow-lg transition-transform duration-300"
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
