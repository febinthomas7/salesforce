import React, { useState, useMemo } from "react";
import {
  UserPlus,
  Edit,
  Trash2,
  Stethoscope,
  Search,
  Calendar,
} from "lucide-react";
import DoctorForm from "./DoctorForm";
import { initialDoctorForm } from "../../../utils";
import { doctorsData } from "../../../utils";
import { registerDoctor } from "../../../api/auth";
const DoctorsSection = () => {
  const [doctors, setDoctors] = useState(doctorsData);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialDoctorForm);
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const onAddDoctor = (doctor) => {
    const newDoctor = {
      ...doctor,
      id: "DOC" + Math.floor(Math.random() * 1000 + 100),
      lastLogin: new Date().toISOString(),
      specialty: doctor.specialization,
      contact: doctor.email,
    };
    setDoctors([newDoctor, ...doctors]);
  };

  const onUpdateDoctor = (id, updatedDoctor) => {
    setDoctors(
      doctors.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...updatedDoctor,
              specialty:
                updatedDoctor.specialization || updatedDoctor.specialty,
              contact: updatedDoctor.email || updatedDoctor.contact,
            }
          : doc
      )
    );
  };

  const onDeleteDoctor = (id) => {
    setDoctors(doctors.filter((doc) => doc.id !== id));
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingDoctorId) {
      onUpdateDoctor(editingDoctorId, formData);
      setEditingDoctorId(null);
    } else {
      onAddDoctor(formData);
      registerDoctor(formData);
      console.log(formData);
    }
    setFormData(initialDoctorForm);
    setIsFormOpen(false);
  };

  const handleEditClick = (doctor) => {
    setFormData(doctor);
    setEditingDoctorId(doctor.doctor_id);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => onDeleteDoctor(id);

  const handleAddNewClick = () => {
    setIsFormOpen(true);
    setEditingDoctorId(null);
    setFormData(initialDoctorForm);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setFormData(initialDoctorForm);
    setEditingDoctorId(null);
  };

  // Filter & sort doctors
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (doc.npi_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        doc.specialization === selectedSpecialization;

      const matchesHospital =
        selectedHospital === "all" || doc.npi_id === selectedHospital;

      return matchesSearch && matchesSpecialization && matchesHospital;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "created_at") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return filtered;
  }, [
    doctors,
    searchTerm,
    selectedSpecialization,
    selectedHospital,
    sortBy,
    sortOrder,
  ]);

  // Unique values for dropdown filters
  const specializations = [
    "all",
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];
  const hospitals = [
    "all",
    ...new Set(doctors.map((d) => d.npi_id).filter(Boolean)),
  ];

  return (
    <div className="space-y-8 p-10 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-[var(--color-text)]">
          Doctors List
        </h2>
        <button
          onClick={handleAddNewClick}
          className="bg-gradient-to-r from-[#0b4f4a] to-[#1a756f] text-white px-6 py-3 rounded-2xl font-medium flex items-center shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] rounded-2xl shadow-2xl p-8 mb-6 text-white h-50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
            <input
              type="text"
              placeholder="Search by name, email, specialty, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white"
            />
          </div>

          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-black"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-black"
          >
            {hospitals.map((h) => (
              <option key={h} value={h}>
                {h}
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
            className="px-3 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 text-black"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>

        <div className="text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          Showing {filteredAndSortedDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Doctor Form */}
      {isFormOpen && (
        <DoctorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          editingDoctorId={editingDoctorId}
        />
      )}

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedDoctors?.map((doctor, index) => (
          <div
            key={index}
            className="bg-[var(--color-card-bg)] rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.08)] border-[var(--color-border)] hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--color-card-text)]">
                {doctor.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(doctor)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(doctor.doctor_id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Email:</strong> {doctor.email}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Specialty:</strong> {doctor.specialization}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Contact:</strong> {doctor.phone_no}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[#0b4f4a]" />
              <span>
                <strong>Hospital NPI:</strong> {doctor.npi_id}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Joined: {new Date(doctor.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
        ))}

        {filteredAndSortedDoctors.length === 0 && (
          <div className="col-span-full text-center text-gray-400 p-12 border border-gray-100 rounded-2xl">
            <Search className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p>
              Try adjusting your search criteria or filters to find doctors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsSection;
