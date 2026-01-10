import React, { useState } from "react";
import { Send, User, Phone, CreditCard, Calendar } from "lucide-react";

const ReceptionistForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold mb-4">
        {editingId ? "Edit Receptionist" : "New Receptionist"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          icon={User}
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          label="Phone Number"
          icon={Phone}
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
        />
        <Input
          label="Aadhaar Number"
          icon={CreditCard}
          name="adhaar_no"
          value={formData.adhaar_no}
          onChange={handleChange}
        />
        <Input
          label="Email"
          icon={CreditCard}
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label="Date of Birth"
          icon={Calendar}
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Send className="h-4 w-4" /> Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="text-xs font-bold text-gray-500">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        {...props}
        className="w-full pl-9 py-2 bg-gray-50 border rounded-lg"
      />
    </div>
  </div>
);

export default ReceptionistForm;
