import {
  Calendar,
  Heart,
  Shield,
  Phone,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react";

import { getCategoryIcon, formatDate, getAge } from "../../../utils";
import { mockPatient, mockReports } from "../../../utils";

const Dashboard = () => {
  const recentReports = mockReports.slice(0, 3);
  // Filter for high priority reports
  const criticalReports = mockReports.filter(
    (r) => r.priority === "critical" || r.priority === "high"
  );

  return (
    <div className="w-full h-full mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Welcome Section with the new gradient */}
      <div className="  bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] rounded-2xl p-8 text-white mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between ">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {localStorage.getItem("dashboardName")}!
            </h1>
            <p className="text-stone-100">
              Your complete medical history at a glance
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  Last visit: {formatDate(mockReports[0]?.date || new Date())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Info */}
        <div className="lg:col-span-1">
          <div className="bg-white text-black rounded-2xl shadow-xl p-6 mb-6 border border-rose-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="h-6 w-6 text-rose-500 mr-3" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{getAge(mockPatient)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Group:</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                  {mockPatient.bloodGroup}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">
                  {mockPatient.gender}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                  Emergency Contact
                </div>
                <p className="font-medium">
                  {mockPatient.emergencyContact.name}
                </p>
                <p className="text-sm text-gray-600">
                  {mockPatient.emergencyContact.relation}
                </p>
                <p className="text-sm text-gray-600">
                  {mockPatient.emergencyContact.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Health Alerts */}
          {(mockPatient.allergies.length > 0 ||
            mockPatient.chronicConditions.length > 0) && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 text-amber-500 mr-3" />
                Health Alerts
              </h2>

              {mockPatient.allergies.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Allergies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mockPatient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mockPatient.chronicConditions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                    Chronic Conditions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mockPatient.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-700">
                    {mockReports.length}
                  </p>
                  <p className="text-blue-600 font-medium">Total Reports</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-700">
                    {criticalReports.length}
                  </p>
                  <p className="text-red-600 font-medium">High Priority</p>
                </div>
                <div className="bg-red-500 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-xl p-6 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-700">
                    {
                      mockReports.filter((r) => {
                        const reportDate = new Date(r.date);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return reportDate >= thirtyDaysAgo;
                      }).length
                    }
                  </p>
                  <p className="text-emerald-600 font-medium">This Month</p>
                </div>
                <div className="bg-emerald-500 p-3 rounded-xl">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 text-indigo-500 mr-3" />
                Recent Reports
              </h2>
              <button
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                onClick={() => {}}
              >
                View All Reports →
              </button>
            </div>

            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-indigo-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">
                        {getCategoryIcon(report.category)}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Dr. {report.doctorName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.hospital}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatDate(report.date)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          report.priority === "critical"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : report.priority === "high"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : report.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {report.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
