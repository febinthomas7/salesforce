import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  Stethoscope,
  ShieldCheck,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  AlertTriangle,
  Megaphone, // New icon
  X,
} from "lucide-react";

// --- MOCK DATA ---
const initialPatientsData = Array.from({ length: 25 }, (_, i) => ({
    id: `PAT${String(i + 1).padStart(3, '0')}`,
    name: `Patient Name ${i + 1}`,
    aadhaar: `XXXX XXXX ${String(1000 + i).padStart(4, '0')}`,
    lastLogin: new Date(new Date().setDate(new Date().getDate() - i)).toISOString(),
    status: i % 4 === 0 ? "Suspended" : "Active",
}));

const initialHospitalsData = Array.from({ length: 18 }, (_, i) => ({
    id: `HOS${String(i + 1).padStart(2, '0')}`,
    name: `Hospital Center ${i + 1}`,
    npi: `${String(1234567890 + i)}`,
    doctors: 20 + i * 2,
    totalReports: 500 + i * 50,
    status: i % 5 === 0 ? "Pending" : "Verified",
}));

const initialDoctorsData = Array.from({ length: 32 }, (_, i) => ({
    id: `DOC${String(101 + i)}`,
    doctorId: `MEDLOCK-D-${String.fromCharCode(65 + (i%26))}${String.fromCharCode(65 + (i%13))}-${100+i}`,
    name: `Dr. ${String.fromCharCode(65 + i)} Lastname`,
    specialty: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology"][i % 4],
    hospital: `Hospital Center ${i % 5 + 1}`,
    hospitalNpi: `${String(1234567890 + i % 5)}`,
    status: i % 6 === 0 ? "Unverified" : "Verified",
}));

const initialReportsData = Array.from({ length: 45 }, (_, i) => {
    const doctor = initialDoctorsData[i % initialDoctorsData.length];
    return {
        id: `REP${String(i + 1).padStart(3, '0')}`,
        patientName: `Patient Name ${i + 1}`,
        aadhaar: `XXXX XXXX ${String(1000 + i).padStart(4, '0')}`,
        doctorId: doctor.doctorId,
        hospitalName: doctor.hospital,
        hospitalNpi: doctor.hospitalNpi,
        type: ["Echocardiogram", "X-Ray Report", "Blood Test", "MRI Scan"][i % 4],
        status: ["Reviewed", "Pending", "In Progress"][i % 3],
        name: `Report ${`REP${String(i + 1).padStart(3, '0')}`}` // Name for delete modal
    };
});

const initialAnnouncementsData = [
    { id: 'ANN001', title: 'System Maintenance Scheduled', message: 'The system will be down for scheduled maintenance on Sunday from 2:00 AM to 4:00 AM.', type: 'Warning', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
    { id: 'ANN002', title: 'New Feature: 2FA', message: 'All admin accounts now support 2-Factor Authentication. Please enable it in your security settings.', type: 'Info', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
    { id: 'ANN003', title: 'Policy Update', message: 'Patient data retention policy has been updated. Please review the new documentation.', type: 'Info', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() },
];


const portalStats = {
  totalPatients: 12580,
  totalHospitals: 152,
  totalDoctors: 4670,
  totalReports: 27890,
  totalAnnouncements: 3,
};

// --- UI HELPER COMPONENTS ---

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl medical-shadow-light border border-white/40 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
    <div>
      <p className="text-gray-600 font-medium">{title}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
    <div className={`p-3 rounded-full bg-${colorClass.split("-")[2]}-100`}>
      {icon}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    Active: { text: "text-green-800", bg: "bg-green-100", icon: <CheckCircle className="h-4 w-4" /> },
    Suspended: { text: "text-red-800", bg: "bg-red-100", icon: <XCircle className="h-4 w-4" /> },
    Verified: { text: "text-blue-800", bg: "bg-blue-100", icon: <ShieldCheck className="h-4 w-4" /> },
    Pending: { text: "text-yellow-800", bg: "bg-yellow-100", icon: <Clock className="h-4 w-4" /> },
    Unverified: { text: "text-gray-800", bg: "bg-gray-200", icon: <Clock className="h-4 w-4" /> },
    Reviewed: { text: "text-green-800", bg: "bg-green-100", icon: <CheckCircle className="h-4 w-4" /> },
    "In Progress": { text: "text-purple-800", bg: "bg-purple-100", icon: <Clock className="h-4 w-4" /> },
    // For Announcements
    Info: { text: "text-blue-800", bg: "bg-blue-100", icon: <Bell className="h-4 w-4" /> },
    Warning: { text: "text-yellow-800", bg: "bg-yellow-100", icon: <AlertTriangle className="h-4 w-4" /> },
    Critical: { text: "text-red-800", bg: "bg-red-100", icon: <AlertTriangle className="h-4 w-4" /> }
  }[status];
  
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

const ManagementCard = ({ title, icon, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300"
    >
        <div className="flex justify-between items-start">
            <div>
                {icon}
                <h3 className="text-2xl font-bold text-teal-900 mt-4">{title}</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        <p className="text-gray-600 mt-2">Click to manage all {title.toLowerCase()}.</p>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                <ArrowLeft className="h-4 w-4" />
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                Next
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-out ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div
                className={`bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out ${
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                <div className="flex items-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">Confirm Deletion</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">{itemName}</span>? This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW CRUD MODAL COMPONENT ---
const CrudModal = ({ isOpen, onClose, onSubmit, item, type }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            // Set default values for new items
            setFormData(
                type === 'patient' ? { name: '', aadhaar: '', status: 'Active' } :
                type === 'hospital' ? { name: '', npi: '', doctors: 0, totalReports: 0, status: 'Pending' } :
                type === 'doctor' ? { name: '', doctorId: '', specialty: '', hospital: '', hospitalNpi: '', status: 'Unverified' } :
                type === 'announcement' ? { title: '', message: '', type: 'Info' } :
                {}
            );
        }
    }, [item, type, isOpen]); // Reset form when modal opens

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, type);
    };

    const renderFormFields = () => {
        switch (type) {
            case 'patient':
                return (
                    <>
                        <InputField label="Patient Name" name="name" value={formData.name} onChange={handleChange} />
                        <InputField label="Aadhaar No." name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
                        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={['Active', 'Suspended']} />
                    </>
                );
            case 'hospital':
                return (
                    <>
                        <InputField label="Hospital Name" name="name" value={formData.name} onChange={handleChange} />
                        <InputField label="NPI" name="npi" value={formData.npi} onChange={handleChange} />
                        <InputField label="Doctors" name="doctors" type="number" value={formData.doctors} onChange={handleChange} />
                        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={['Verified', 'Pending']} />
                    </>
                );
            case 'doctor':
                return (
                    <>
                        <InputField label="Doctor Name" name="name" value={formData.name} onChange={handleChange} />
                        <InputField label="Doctor ID" name="doctorId" value={formData.doctorId} onChange={handleChange} />
                        <InputField label="Specialty" name="specialty" value={formData.specialty} onChange={handleChange} />
                        <InputField label="Hospital" name="hospital" value={formData.hospital} onChange={handleChange} />
                        <InputField label="Hospital NPI" name="hospitalNpi" value={formData.hospitalNpi} onChange={handleChange} />
                        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={['Verified', 'Unverified']} />
                    </>
                );
            case 'announcement':
                return (
                    <>
                        <InputField label="Title" name="title" value={formData.title} onChange={handleChange} />
                        <TextAreaField label="Message" name="message" value={formData.message} onChange={handleChange} />
                        <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={['Info', 'Warning', 'Critical']} />
                    </>
                );
            default:
                return <p>Invalid form type.</p>;
        }
    };

    const title = `${item ? 'Edit' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    return (
        <div className="fixed inset-0 z-40 flex justify-center items-center p-4 transition-opacity duration-300 ease-out opacity-100">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 opacity-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-teal-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFormFields()}
                    <div className="flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#1a756f] rounded-lg hover:bg-[#0b4f4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
                            {item ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Form Field Components
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
    </div>
);
const TextAreaField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} rows="4" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
    </div>
);
const SelectField = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors bg-white">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---
const AdminPortalDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [patientsData, setPatientsData] = useState(initialPatientsData);
  const [hospitalsData, setHospitalsData] = useState(initialHospitalsData);
  const [doctorsData, setDoctorsData] = useState(initialDoctorsData);
  const [reportsData, setReportsData] = useState(initialReportsData);
  const [announcementsData, setAnnouncementsData] = useState(initialAnnouncementsData);

  const [patientSearch, setPatientSearch] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");

  const [currentPagePatients, setCurrentPagePatients] = useState(1);
  const [currentPageHospitals, setCurrentPageHospitals] = useState(1);
  const [currentPageDoctors, setCurrentPageDoctors] = useState(1);
  const [currentPageReports, setCurrentPageReports] = useState(1);
  const [currentPageAnnouncements, setCurrentPageAnnouncements] = useState(1);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // --- Delete Logic ---
  const requestDelete = (item, type) => {
    setItemToDelete({ ...item, type });
    setIsConfirmModalOpen(true);
  };
  const confirmDelete = () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    
    switch (type) {
      case "patient": setPatientsData(prev => prev.filter((p) => p.id !== id)); break;
      case "hospital": setHospitalsData(prev => prev.filter((h) => h.id !== id)); break;
      case "doctor": setDoctorsData(prev => prev.filter((d) => d.id !== id)); break;
      case "report": setReportsData(prev => prev.filter((r) => r.id !== id)); break;
      case "announcement": setAnnouncementsData(prev => prev.filter((a) => a.id !== id)); break;
      default: break;
    }
    cancelDelete();
  };
  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  };

  // --- Add/Edit Logic ---
  const handleAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setIsModalOpen(true);
  };
  const handleEdit = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleCrudSubmit = (formData, type) => {
    if (editingItem) {
        // Update
        switch (type) {
            case 'patient': setPatientsData(prev => prev.map(p => p.id === editingItem.id ? formData : p)); break;
            case 'hospital': setHospitalsData(prev => prev.map(h => h.id === editingItem.id ? formData : h)); break;
            case 'doctor': setDoctorsData(prev => prev.map(d => d.id === editingItem.id ? formData : d)); break;
            case 'announcement': setAnnouncementsData(prev => prev.map(a => a.id === editingItem.id ? formData : a)); break;
            default: break;
        }
    } else {
        // Add new
        const newItem = { ...formData, id: `${type.toUpperCase()}${Date.now()}` };
        if (type === 'announcement') newItem.date = new Date().toISOString();
        if (type === 'patient') newItem.lastLogin = new Date().toISOString();

        switch (type) {
            case 'patient': setPatientsData(prev => [newItem, ...prev]); break;
            case 'hospital': setHospitalsData(prev => [newItem, ...prev]); break;
            case 'doctor': setDoctorsData(prev => [newItem, ...prev]); break;
            case 'announcement': setAnnouncementsData(prev => [newItem, ...prev]); break;
            default: break;
        }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // --- Filtering Logic ---
  const filteredPatients = patientsData.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.aadhaar.toLowerCase().includes(patientSearch.toLowerCase()));
  const filteredHospitals = hospitalsData.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || h.npi.toLowerCase().includes(hospitalSearch.toLowerCase()));
  const filteredDoctors = doctorsData.filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || d.doctorId.toLowerCase().includes(doctorSearch.toLowerCase()) || d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) || d.hospital.toLowerCase().includes(doctorSearch.toLowerCase()) || d.hospitalNpi.toLowerCase().includes(doctorSearch.toLowerCase()));
  const filteredReports = reportsData.filter(r => r.patientName.toLowerCase().includes(reportSearch.toLowerCase()) || r.aadhaar.toLowerCase().includes(reportSearch.toLowerCase()) || r.doctorId.toLowerCase().includes(reportSearch.toLowerCase()) || r.hospitalName.toLowerCase().includes(reportSearch.toLowerCase()));
  const filteredAnnouncements = announcementsData.filter(a => a.title.toLowerCase().includes(announcementSearch.toLowerCase()) || a.message.toLowerCase().includes(announcementSearch.toLowerCase()));

  // --- Search Handlers (with pagination reset) ---
  const handlePatientSearch = (value) => { setPatientSearch(value); setCurrentPagePatients(1); };
  const handleHospitalSearch = (value) => { setHospitalSearch(value); setCurrentPageHospitals(1); };
  const handleDoctorSearch = (value) => { setDoctorSearch(value); setCurrentPageDoctors(1); };
  const handleReportSearch = (value) => { setReportSearch(value); setCurrentPageReports(1); };
  const handleAnnouncementSearch = (value) => { setAnnouncementSearch(value); setCurrentPageAnnouncements(1); };

  const renderContent = () => {
    // --- Pagination Logic ---
    const totalPagesPatients = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
    const paginatedPatients = filteredPatients.slice((currentPagePatients - 1) * ITEMS_PER_PAGE, currentPagePatients * ITEMS_PER_PAGE);

    const totalPagesHospitals = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE);
    const paginatedHospitals = filteredHospitals.slice((currentPageHospitals - 1) * ITEMS_PER_PAGE, currentPageHospitals * ITEMS_PER_PAGE);
    
    const totalPagesDoctors = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
    const paginatedDoctors = filteredDoctors.slice((currentPageDoctors - 1) * ITEMS_PER_PAGE, currentPageDoctors * ITEMS_PER_PAGE);

    const totalPagesReports = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const paginatedReports = filteredReports.slice((currentPageReports - 1) * ITEMS_PER_PAGE, currentPageReports * ITEMS_PER_PAGE);
    
    const totalPagesAnnouncements = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
    const paginatedAnnouncements = filteredAnnouncements.slice((currentPageAnnouncements - 1) * ITEMS_PER_PAGE, currentPageAnnouncements * ITEMS_PER_PAGE);

    switch (activeView) {
      case "patients":
        return <PatientManagementView onBack={() => setActiveView("dashboard")} data={paginatedPatients} onEdit={handleEdit} onRequestDelete={requestDelete} onAdd={handleAdd} formatDate={formatDate} searchTerm={patientSearch} onSearchChange={handlePatientSearch} currentPage={currentPagePatients} totalPages={totalPagesPatients} onPageChange={setCurrentPagePatients} />;
      case "hospitals":
        return <HospitalManagementView onBack={() => setActiveView("dashboard")} data={paginatedHospitals} onEdit={handleEdit} onRequestDelete={requestDelete} onAdd={handleAdd} searchTerm={hospitalSearch} onSearchChange={handleHospitalSearch} currentPage={currentPageHospitals} totalPages={totalPagesHospitals} onPageChange={setCurrentPageHospitals} />;
      case "doctors":
        return <DoctorManagementView onBack={() => setActiveView("dashboard")} data={paginatedDoctors} onEdit={handleEdit} onRequestDelete={requestDelete} onAdd={handleAdd} searchTerm={doctorSearch} onSearchChange={handleDoctorSearch} currentPage={currentPageDoctors} totalPages={totalPagesDoctors} onPageChange={setCurrentPageDoctors} />;
      case "reports":
        return <ReportManagementView onBack={() => setActiveView("dashboard")} data={paginatedReports} onRequestDelete={requestDelete} searchTerm={reportSearch} onSearchChange={handleReportSearch} currentPage={currentPageReports} totalPages={totalPagesReports} onPageChange={setCurrentPageReports} />;
      case "announcements":
        return <AnnouncementManagementView onBack={() => setActiveView("dashboard")} data={paginatedAnnouncements} onEdit={handleEdit} onRequestDelete={requestDelete} onAdd={handleAdd} formatDate={formatDate} searchTerm={announcementSearch} onSearchChange={handleAnnouncementSearch} currentPage={currentPageAnnouncements} totalPages={totalPagesAnnouncements} onPageChange={setCurrentPageAnnouncements} />;
      default:
        return <DashboardHomeView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            itemName={itemToDelete?.name || itemToDelete?.title}
        />
        <CrudModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCrudSubmit}
            item={editingItem}
            type={modalType}
        />
        <Header onAddAnnouncement={() => handleAdd('announcement')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Patients" value={portalStats.totalPatients} icon={<Users className="h-8 w-8 text-teal-500" />} colorClass="text-teal-700" />
          <StatCard title="Registered Hospitals" value={portalStats.totalHospitals} icon={<Building className="h-8 w-8 text-cyan-500" />} colorClass="text-cyan-700" />
          <StatCard title="Verified Doctors" value={portalStats.totalDoctors} icon={<Stethoscope className="h-8 w-8 text-emerald-500" />} colorClass="text-emerald-700" />
          <StatCard title="Total Announcements" value={announcementsData.length} icon={<Megaphone className="h-8 w-8 text-indigo-500" />} colorClass="text-indigo-700" />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR EACH VIEW ---

const Header = ({ onAddAnnouncement }) => (
  <div className="relative text-white overflow-hidden rounded-3xl py-10 px-8 mb-8 shadow-2xl bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] flex justify-between items-center">
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Admin Portal Dashboard</h1>
      <p className="text-lg text-teal-100 mt-1">Monitor and manage all MedLock portals.</p>
    </div>
    <div className="flex items-center gap-4">
      <button className="relative text-teal-200 hover:text-white transition-colors duration-200">
        <Bell className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
      </button>
      <button onClick={onAddAnnouncement} className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200">
        <PlusCircle className="h-5 w-5" />
        Create Announcement
      </button>
    </div>
  </div>
);

const DashboardHomeView = ({ onNavigate }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ManagementCard title="Patient Management" icon={<Users className="h-10 w-10 text-teal-600" />} onClick={() => onNavigate("patients")} />
        <ManagementCard title="Hospital Management" icon={<Building className="h-10 w-10 text-cyan-600" />} onClick={() => onNavigate("hospitals")} />
        <ManagementCard title="Doctor Verification" icon={<Stethoscope className="h-10 w-10 text-emerald-600" />} onClick={() => onNavigate("doctors")} />
        <ManagementCard title="Report Monitoring" icon={<FileText className="h-10 w-10 text-indigo-600" />} onClick={() => onNavigate("reports")} />
        <ManagementCard title="Announcements" icon={<Megaphone className="h-10 w-10 text-purple-600" />} onClick={() => onNavigate("announcements")} />
    </div>
);

const ViewHeader = ({ title, onBack, onAdd, addLabel, searchTerm, onSearchChange }) => (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
                <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-3xl font-bold text-teal-900">{title}</h2>
        </div>
        <div className="flex items-center gap-4 flex-grow sm:flex-grow-0">
             {onSearchChange && (
                <div className="relative flex-grow min-w-[200px] transition-all duration-300 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 rounded-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${title.split(' ')[0].toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 transition-colors duration-200"
                    />
                </div>
            )}
            {onAdd && (
                <button onClick={onAdd} className="bg-[#1a756f] hover:bg-[#0b4f4a] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200">
                    <PlusCircle className="h-5 w-5" />
                    {addLabel}
                </button>
            )}
        </div>
    </div>
);

const PatientManagementView = ({ onBack, data, onEdit, onRequestDelete, onAdd, formatDate, searchTerm, onSearchChange, currentPage, totalPages, onPageChange }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6">
        <ViewHeader title="Patient Management" onBack={onBack} onAdd={() => onAdd('patient')} addLabel="Add Patient" searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Aadhaar No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{p.name}</div><div className="text-sm text-gray-500 font-mono">{p.aadhaar}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.lastLogin)}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <button onClick={() => onEdit(p, "patient")} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200"><Edit className="h-5 w-5" /></button>
                                <button onClick={() => onRequestDelete(p, "patient")} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200"><Trash2 className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
);

const HospitalManagementView = ({ onBack, data, onEdit, onRequestDelete, onAdd, searchTerm, onSearchChange, currentPage, totalPages, onPageChange }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6">
        <ViewHeader title="Hospital Management" onBack={onBack} onAdd={() => onAdd('hospital')} addLabel="Add Hospital" searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name & NPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctors</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((h) => (
                         <tr key={h.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{h.name}</div><div className="text-sm text-gray-500">NPI: {h.npi}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{h.doctors}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{h.totalReports.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={h.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <button onClick={() => onEdit(h, "hospital")} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200"><Edit className="h-5 w-5" /></button>
                                <button onClick={() => onRequestDelete(h, "hospital")} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200"><Trash2 className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
);

const DoctorManagementView = ({ onBack, data, onEdit, onRequestDelete, onAdd, searchTerm, onSearchChange, currentPage, totalPages, onPageChange }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6">
        <ViewHeader title="Doctor Verification" onBack={onBack} onAdd={() => onAdd('doctor')} addLabel="Add Doctor" searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital & NPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((d) => (
                         <tr key={d.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{d.name} ({d.specialty})</div>
                                <div className="text-sm text-gray-500 font-mono">ID: {d.doctorId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{d.hospital}</div>
                                <div className="text-sm text-gray-500">NPI: {d.hospitalNpi}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={d.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <button onClick={() => onEdit(d, "doctor")} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200"><Edit className="h-5 w-5" /></button>
                                <button onClick={() => onRequestDelete(d, "doctor")} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200"><Trash2 className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
);

const ReportManagementView = ({ onBack, data, searchTerm, onSearchChange, currentPage, totalPages, onPageChange, onRequestDelete }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6">
        <ViewHeader title="Report Monitoring" onBack={onBack} searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient & Report Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Doctor ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital & NPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{r.id}</td>
                            <td className="px-6 py-4 whitespace-noww-rap"><div className="font-medium text-gray-900">{r.patientName}</div><div className="text-sm text-gray-500">{r.type}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{r.aadhaar}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{r.doctorId}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{r.hospitalName}</div><div className="text-sm text-gray-500">NPI: {r.hospitalNpi}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <button onClick={() => onRequestDelete(r, "report")} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200"><Trash2 className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
);

// --- NEW ANNOUNCEMENT VIEW ---
const AnnouncementManagementView = ({ onBack, data, onEdit, onRequestDelete, onAdd, formatDate, searchTerm, onSearchChange, currentPage, totalPages, onPageChange }) => (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl medical-shadow-light border border-white/40 p-6">
        <ViewHeader title="Announcement Management" onBack={onBack} onAdd={() => onAdd('announcement')} addLabel="Add Announcement" searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{a.title}</div>
                                <div className="text-sm text-gray-500">{formatDate(a.date)}</div>
                            </td>
                            <td className="px-6 py-4 max-w-sm">
                                <p className="text-sm text-gray-700 truncate" title={a.message}>{a.message}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={a.type} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <button onClick={() => onEdit(a, "announcement")} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200"><Edit className="h-5 w-5" /></button>
                                <button onClick={() => onRequestDelete(a, "announcement")} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200"><Trash2 className="h-5 w-5" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
);


export default AdminPortalDashboard;