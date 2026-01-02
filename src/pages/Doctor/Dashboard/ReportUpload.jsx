import { useState } from "react";
import {
  Upload,
  FileText,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { mockReports } from "../../../utils";

const ReportUpload = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    title: "",
    category: "lab",
    dateOfExpire: "", 
    description: "",
    priority: "medium",
    tags: "",
  });

  const [reports, setReports] = useState(mockReports);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateError, setDateError] = useState("");

  // Logic to disable today and past dates (Minimum date is tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minExpiryDate = tomorrow.toISOString().split("T")[0];

  const categories = [
    { value: "lab", label: "Lab Tests", icon: "🧪" },
    { value: "imaging", label: "Imaging", icon: "📊" },
    { value: "prescription", label: "Prescriptions", icon: "💊" },
    { value: "consultation", label: "Consultations", icon: "👨‍⚕️" },
    { value: "surgery", label: "Surgery", icon: "🏥" },
    { value: "vaccination", label: "Vaccinations", icon: "💉" },
    { value: "other", label: "Other", icon: "📄" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "critical", label: "Critical", color: "text-red-600" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "dateOfExpire") setDateError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) setUploadedFile(files[0]);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) setUploadedFile(files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Expiry must be a future date
    if (formData.dateOfExpire) {
      const selectedDate = new Date(formData.dateOfExpire);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        setDateError("Expiry date must be a future date (cannot be today or past).");
        return;
      }
    }

    const newReport = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      title: formData.title,
      category: formData.category,
      dateOfExpire: formData.dateOfExpire, 
      description: formData.description,
      priority: formData.priority,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      fileUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined,
    };

    setReports((prevReports) => [newReport, ...prevReports]);

    setFormData({
      patientName: "",
      title: "",
      category: "lab",
      dateOfExpire: "", 
      description: "",
      priority: "medium",
      tags: "",
    });
    setUploadedFile(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const removeFile = () => setUploadedFile(null);

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-[#e8f2f1] to-[#f0f5f4] border border-[#8FBEB9] rounded-2xl p-6 mb-8 flex items-center shadow-lg">
          <div className="bg-[#8FBEB9] p-2 rounded-xl mr-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#3b6b66] text-lg">Patient report added successfully!</p>
            <p className="text-[#518b85]">The medical report has been added to the patient's history.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-3">Add Patient Report</h1>
        <p className="text-gray-100 text-lg">Fill in the details to add a new medical report to the patient's record.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* File Upload Area */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-4">Upload Report File (Optional)</label>
            <div
              className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                dragOver ? "border-[#8FBEB9] bg-gradient-to-br from-[#e8f2f1] to-[#f0f5f4] scale-105" : 
                uploadedFile ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50" : 
                "border-gray-300 hover:border-[#8FBEB9] hover:bg-gradient-to-br hover:from-[#e8f2f1] hover:to-gray-50"
              }`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="bg-green-500 p-3 rounded-xl"><FileText className="h-12 w-12 text-white" /></div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-colors"><X className="h-5 w-5" /></button>
                </div>
              ) : (
                <div>
                  <div className="bg-gradient-to-br from-[#8FBEB9] to-[#7aa9a4] p-4 rounded-2xl mx-auto w-fit mb-6"><Upload className="h-16 w-16 text-white" /></div>
                  <p className="text-xl font-bold text-gray-900 mb-3">Drop the patient's report here, or click to browse</p>
                  <p className="text-gray-600 mb-6">Supports: PDF, JPG, PNG, DOC, DOCX (Max: 10MB)</p>
                  <input type="file" onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="bg-gradient-to-r from-[#8FBEB9] to-[#7aa9a4] hover:from-[#7aa9a4] hover:to-[#8FBEB9] text-white px-8 py-4 rounded-xl cursor-pointer font-bold transition-all duration-200 inline-block shadow-lg hover:shadow-xl">Choose File</label>
                </div>
              )}
            </div>
          </div>

          {/* Patient Name */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">Patient Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8FBEB9] h-6 w-6" />
              <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} required placeholder="e.g., Rohan Sharma" className="w-full pl-12 pr-4 py-3 border-2 text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg" />
            </div>
          </div>

          {/* Report Title */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">Report Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g., Complete Blood Count (CBC)" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 text-black focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 border-2 text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg">
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Date of Expire */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Date of Expire</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8FBEB9] h-6 w-6" />
              <input 
                type="date" 
                name="dateOfExpire" 
                min={minExpiryDate} 
                value={formData.dateOfExpire} 
                onChange={handleInputChange} 
                className={`w-full pl-12 pr-4 py-3 border-2 text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg ${dateError ? 'border-red-500' : ''}`} 
              />
            </div>
            {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
          </div>

          {/* Priority */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-4">Priority Level *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorities.map((priority) => (
                <label key={priority.value} className={`border-3 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${formData.priority === priority.value ? "border-[#8FBEB9] bg-gradient-to-br from-[#e8f2f1] to-gray-50 shadow-lg scale-105" : "border-gray-300 hover:border-[#8FBEB9] hover:bg-gradient-to-br hover:from-[#e8f2f1] hover:to-gray-50"}`}>
                  <input type="radio" name="priority" value={priority.value} checked={formData.priority === priority.value} onChange={handleInputChange} className="sr-only" />
                  <div className="text-center">
                    <AlertCircle className={`h-8 w-8 mx-auto mb-3 ${priority.color}`} />
                    <span className={`font-bold text-lg ${priority.color}`}>{priority.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">Description/Notes</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Add any additional notes or description about this report..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg" />
          </div>

          {/* Tags */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">Tags (Optional)</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8FBEB9] h-6 w-6" />
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="e.g., routine, blood-work, normal (comma separated)" className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBEB9] focus:border-[#8FBEB9] transition-all duration-200 text-lg" />
            </div>
            <p className="text-gray-600 mt-2">Separate multiple tags with commas for better organization</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-end">
          <button type="submit" className="bg-gradient-to-r from-[#8FBEB9] to-[#7aa9a4] hover:from-[#7aa9a4] hover:to-[#8FBEB9] text-white px-10 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center shadow-2xl hover:shadow-3xl hover:scale-105">
            <Upload className="h-6 w-6 mr-3" />
            Add Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportUpload;