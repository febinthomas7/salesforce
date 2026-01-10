import React, { useState, useMemo, useEffect } from "react";
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  Calendar,
  X,
  CheckCircle,
  ArrowUpDown,
  User,
} from "lucide-react";

import {
  getReceptionistsByHospital,
  registerReceptionist,
} from "../../../api/auth";
import ReceptionistForm from "./ReceptionistForm";

const initialReceptionistForm = {
  name: "",
  phone_no: "",
  adhaar_no: "",
  date_of_birth: "",
};

const token = localStorage.getItem("token");

const ReceptionistSection = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialReceptionistForm);
  const [editingId, setEditingId] = useState(null);

  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  /* 🔹 LOAD DATA */
  useEffect(() => {
    async function loadReceptionists() {
      try {
        const res = await getReceptionistsByHospital(token);
        if (res?.status) {
          const mapped = res.receptionists.map((r) => ({
            id: r.Receptionist_Id__c,
            name: r.Name || "",
            phone_no: r.Phone_No__c || "",
            adhaar_no: r.Adhaar_No__c || "",
            date_of_birth: r.Date_of_Birth__c || "",
            created_at: r.CreatedDate,
          }));
          setReceptionists(mapped);
        }
      } catch (err) {
        console.error("Load receptionists error:", err);
      }
    }
    loadReceptionists();
  }, []);

  /* 🔹 HANDLERS */
  const handleAddNew = () => {
    setFormData(initialReceptionistForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rec) => {
    setFormData(rec);
    setEditingId(rec.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      setReceptionists((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...formData } : r))
      );
      showToast("Receptionist updated successfully!");
    } else {
      const res = await registerReceptionist(token, formData);
      if (res?.status) {
        setReceptionists((prev) => [
          {
            ...formData,
            id: res.id || Date.now().toString(),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        showToast("Receptionist added successfully!");
      }
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this receptionist?")) {
      setReceptionists((prev) => prev.filter((r) => r.id !== id));
      showToast("Receptionist removed.");
    }
  };

  /* 🔹 FILTER & SORT */
  const filteredReceptionists = useMemo(() => {
    let data = receptionists.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

    return data;
  }, [receptionists, searchTerm, sortOrder]);

  return (
    <div className="space-y-8 p-10 bg-gray-50 min-h-screen">
      {/* 🔔 Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-teal-700 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
            <CheckCircle className="h-5 w-5" />
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0b4f4a]">Receptionists</h2>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-[#0b4f4a] to-[#1a756f] text-white px-6 py-3 rounded-2xl flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Add Receptionist
        </button>
      </div>

      {/* Search & Sort */}
      <div className="bg-white rounded-xl p-3 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 py-2 rounded-lg bg-gray-50"
            placeholder="Search receptionist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 rounded-lg bg-gray-100"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredReceptionists.map((r) => (
          <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">{r.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(r)}>
                  <Edit className="h-4 w-4 text-indigo-600" />
                </button>
                <button onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-3 space-y-1">
              <p>
                <strong>Phone:</strong> {r.phone_no}
              </p>
              <p>
                <strong>Aadhaar:</strong> {r.adhaar_no}
              </p>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-xl">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <ReceptionistForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              editingId={editingId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistSection;
