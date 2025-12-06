import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Tag,
  Clock,
  User, // Added for patient icon
  ClipboardCheck, // Added for the new "Assign" button
} from "lucide-react";
import { getCategoryIcon, formatDate, getPriorityColor } from "../../../utils";
import { mockReports } from "../../../utils";

const AssignReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Define categories and priorities for the filter options
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "lab", label: "Lab Tests" },
    { value: "imaging", label: "Imaging" },
    { value: "prescription", label: "Prescriptions" },
    { value: "consultation", label: "Consultations" },
  ];

  const priorities = [
    { value: "all", label: "All Priorities" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  // Use useMemo to filter and sort reports efficiently
  const filteredAndSortedReports = useMemo(() => {
    let filtered = mockReports?.filter((report) => {
      // Updated search to include patientName
      const matchesSearch =
        report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.hospital?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || report.category === selectedCategory;
      const matchesPriority =
        selectedPriority === "all" || report.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });

    // Sort reports based on selected criteria
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortBy === "priority") {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        return sortOrder === "desc"
          ? priorityB - priorityA
          : priorityA - priorityB;
      }
      return 0;
    });

    return filtered;
  }, [
    mockReports,
    searchTerm,
    selectedCategory,
    selectedPriority,
    sortBy,
    sortOrder,
  ]);

  return (
    <div className="fade-in w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header updated for doctor's assignment view */}
      <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage & Assign Reports</h1>
            <p className="text-stone-100">
              Search, filter, and manage report access for your patients.
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center border border-white/30">
              <Download className="h-4 w-4 mr-2" />
              Export View
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <input
              type="text"
              placeholder="Search by patient, report title, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/70"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white [&>option]:text-black"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white [&>option]:text-black"
          >
            {priorities.map((pri) => (
              <option key={pri.value} value={pri.value}>
                {pri.label}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setSortBy(sort);
              setSortOrder(order);
            }}
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white [&>option]:text-black"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority-desc">High Priority First</option>
            <option value="priority-asc">Low Priority First</option>
          </select>
        </div>

        <div className="mt-6 text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          Showing {filteredAndSortedReports.length} of {mockReports.length}{" "}
          reports
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredAndSortedReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl bg-gradient-to-br from-[#E1F3F1] to-[#F1F9F8] p-3 rounded-xl border border-[#D5E6E4]">
                    {getCategoryIcon(report.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{report.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      {/* Updated to show Patient Name and ID */}
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Patient: {report.patientName} ({report.patientId})
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(report.date)}
                      </div>
                      <div>🏥 {report.hospital}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority.toUpperCase()}
                  </span>
                  <span className="text-xs px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full capitalize font-medium">
                    {report.category}
                  </span>
                </div>
              </div>

              {/* Actions: Added a new "Assign" button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {formatDate(report.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 p-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium flex items-center text-sm px-3">
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    Assign
                  </button>
                  <button className="text-[#6B9691] hover:text-[#58807C] p-2 rounded-xl hover:bg-[#F1F9F8] transition-all duration-200">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-emerald-600 hover:text-emerald-700 p-2 rounded-xl hover:bg-emerald-50 transition-all duration-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedReports.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 mt-4">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find the reports
            you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignReport;
