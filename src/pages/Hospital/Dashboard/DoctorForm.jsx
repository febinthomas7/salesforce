import React, { useState } from "react";
import { Send } from "lucide-react";

const DoctorForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingDoctorId,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // <-- NEW

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- START LOADING
    await onSubmit(e);
    setLoading(false); // <-- STOP LOADING

    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="fade-in bg-[var(--color-card-bg)] rounded-3xl shadow-[var(--color-shadow)] border border-[var(--color-border)] p-8 max-w-3xl mx-auto">
      <h3 className="text-3xl font-bold text-[var(--color-card-text)] mb-6">
        {editingDoctorId ? "Edit Doctor" : "Add New Doctor"}
      </h3>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter email address"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required={!editingDoctorId}
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder={
              editingDoctorId
                ? "Leave blank to keep current password"
                : "Enter password"
            }
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Phone Number
          </label>
          <input
            type="text"
            name="phone_no"
            value={formData.phone_no || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter phone number"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Adhaar Number
          </label>
          <input
            type="text"
            name="adhaar_no"
            value={formData.adhaar_no || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter adhaar number"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Specialization
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter specialization"
          />
        </div>

        {/* Hospital NPI */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-card-text)] mb-2">
            Hospital NPI
          </label>
          <input
            type="text"
            name="npi_id"
            value={formData.npi_id || ""}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-card-bg)] transition-all"
            placeholder="Enter Hospital NPI"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading} // <-- DISABLE BUTTON
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl text-white bg-[var(--color-primary)] hover:bg-[var(--color-hover)] shadow-[var(--color-shadow)] transition-all transform hover:scale-105"
          >
            {loading ? (
              // LOADER SPINNER
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="mr-2 w-5 h-5" />
                {editingDoctorId ? "Update Doctor" : "Add Doctor"}
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="mt-6 p-6 bg-[var(--color-border)] border-2 border-[var(--color-primary)] rounded-2xl text-[var(--color-card-text)] font-semibold">
            Doctor details have been successfully{" "}
            {editingDoctorId ? "updated" : "added"}!
          </div>
        )}
      </form>
    </div>
  );
};

export default DoctorForm;
