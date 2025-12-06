import { useState, useMemo } from "react";
import { formatDate } from "../../../utils";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Tag,
  Clock,
} from "lucide-react";
import { doctorsData, reportsData } from "../../../utils";

const ReportsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [doctors, setDoctors] = useState(doctorsData);

  const [sortOrder, setSortOrder] = useState("desc");
  const reports = reportsData;

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Lab Test", label: "Lab Tests" },
    { value: "Imaging", label: "Imaging" },
    { value: "Prescription", label: "Prescriptions" },
    { value: "Consultation", label: "Consultations" },
    { value: "Surgery", label: "Surgery" },
    { value: "Vaccination", label: "Vaccinations" },
    { value: "Other", label: "Other" },
  ];

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports
      .map((report) => {
        const doctor = doctors.find((d) => d.id === report.doctor_id);
        return {
          ...report,
          doctorName: doctor ? doctor.name : `Doctor #${report.doctor_id}`,
        };
      })
      .filter((report) => {
        const matchesSearch =
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.npi_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || report.category === selectedCategory;
        const matchesPriority =
          selectedPriority === "all" || report.priority === selectedPriority;

        return matchesSearch && matchesCategory && matchesPriority;
      });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date_of_issue).getTime();
        const dateB = new Date(b.date_of_issue).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const priorityA = priorityOrder[a.priority] || 0;
        const priorityB = priorityOrder[b.priority] || 0;
        return sortOrder === "desc"
          ? priorityB - priorityA
          : priorityA - priorityB;
      }
      return 0;
    });

    return filtered;
  }, [
    reports,
    doctors,
    searchTerm,
    selectedCategory,
    selectedPriority,
    sortBy,
    sortOrder,
  ]);

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Category icon helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Lab Test":
        return "🧪";
      case "Imaging":
        return "📊";
      case "Prescription":
        return "💊";
      case "Consultation":
        return "👨‍⚕️";
      case "Surgery":
        return "🩺";
      case "Vaccination":
        return "💉";
      default:
        return "📄";
    }
  };

  return (
    <div className=" w-full space-y-8 p-10 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[var(--color-text)]">
          Medical Reports
        </h2>
      </div>

      {/* Filter Section */}
      <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] rounded-2xl shadow-2xl p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-xl font-bold mb-2 md:mb-0">Filter Reports</h3>
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl flex items-center border border-white/30">
            <Download className="h-4 w-4 mr-2" /> Export All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
            <input
              type="text"
              placeholder="Search reports, doctors, hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl placeholder-white/70 focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 text-black"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 text-black"
          >
            {priorities.map((pri) => (
              <option key={pri.value} value={pri.value}>
                {pri.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setSortBy(sort);
              setSortOrder(order);
            }}
            className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 text-black"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority-desc">High Priority First</option>
            <option value="priority-asc">Low Priority First</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedReports.map((report) => (
          <div
            key={report.report_id}
            className="bg-[var(--color-card-bg)] rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.08)] border-[var(--color-border)] hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--color-card-text)]">
                {report.title}
              </h3>
              <FileText className="h-6 w-6 text-[#0b4f4a]" />
            </div>

            <p className="text-sm text-gray-500 mb-1">
              <strong>Patient:</strong> {report.patient_adhaar}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Assigned by:</strong> {report.doctorName}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Hospital NPI:</strong> {report.npi_id}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Date of Issue:</strong> {formatDate(report.date_of_issue)}
            </p>
            {report.description && (
              <p className="text-sm text-gray-500 mb-1">
                <strong>Description:</strong> {report.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-1">
              <strong>Priority:</strong> {report.priority || "N/A"},{" "}
              <strong>Category:</strong> {report.category || "N/A"}
            </p>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-4 ${
                report.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {report.status || "Pending"}
            </span>
          </div>
        ))}

        {filteredAndSortedReports.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No reports found
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsSection;
