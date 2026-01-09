import React, { useState, useEffect, useCallback } from "react";
import { Building, Loader2 } from "lucide-react";
import HeroSection from "../../../components/HeroSection";
import HospitalCard from "../../../components/HospitalCard";
import Pagination from "../../../components/Pagination";
import BookingModal from "../../../components/BookingModal";
import { fetchLocations } from "../../../utils/api";
import { hospitalSearch } from "../../../api/auth";
const token = localStorage.getItem("token");

const AppointmentBooking = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Data States
  const [locationData, setLocationData] = useState({});
  const [hospitals, setHospitals] = useState([]);

  // Loading States
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 1. Fetch Location Data on Mount
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoadingLocations(true);
      const data = await fetchLocations();
      setLocationData(data);
      setIsLoadingLocations(false);
    };
    loadLocations();
  }, []);

  // 2. Debounce Search Term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 600); // 600ms delay for search
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchHospitals = async (
    selectedState,
    selectedDistrict,
    debouncedSearch
  ) => {
    const params = new URLSearchParams();
    setIsLoadingHospitals(true);
    setCurrentPage(1); // Reset page on new fetch

    if (selectedState) params.append("state", selectedState);
    if (selectedDistrict) params.append("district", selectedDistrict);
    if (debouncedSearch) params.append("search", debouncedSearch);

    try {
      const res = await hospitalSearch(
        token,
        selectedState,
        selectedDistrict,
        debouncedSearch
      );
      if (res?.status) {
        setHospitals(res.hospitals);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals", error);
    } finally {
      setIsLoadingHospitals(false);
    }
  };
  useEffect(() => {
    fetchHospitals(selectedState, selectedDistrict, debouncedSearch);
  }, [selectedState, selectedDistrict, debouncedSearch]);

  // Reset district when state changes
  useEffect(() => {
    setSelectedDistrict("");
  }, [selectedState]);

  // Pagination Logic (Client-side pagination of fetched results)
  const totalPages = Math.ceil(hospitals.length / itemsPerPage);
  const displayedHospitals = hospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fade-in min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Hero & Filters */}
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        locationData={locationData}
        isLoadingLocations={isLoadingLocations}
      />

      {/* 2. Hospital List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-20 fade-in">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Connected Hospitals
            </h2>
            <p className="text-white text-sm mt-1 font-medium">
              {isLoadingHospitals
                ? "Updating list..."
                : `${hospitals.length} official portals found`}
              {!isLoadingHospitals && selectedState && ` in ${selectedState}`}
              {!isLoadingHospitals &&
                selectedDistrict &&
                `, ${selectedDistrict}`}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingHospitals ? (
          <div className="flex flex-col justify-center items-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">
              Fetching real-time hospital data...
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedHospitals?.map((hospital, index) => (
                <HospitalCard
                  key={index}
                  hospital={hospital}
                  onBook={setSelectedHospital}
                />
              ))}
            </div>

            {/* Empty State */}
            {hospitals.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="bg-gray-50 inline-block p-6 rounded-full mb-4 shadow-inner">
                  <Building className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  No hospitals found
                </h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  We couldn't find any hospitals matching your criteria. Try
                  widening your search or changing the location.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedState("");
                    setSelectedDistrict("");
                  }}
                  className="mt-8 px-6 py-3 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* 3. Booking Modal */}
      {selectedHospital && (
        <BookingModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default AppointmentBooking;
