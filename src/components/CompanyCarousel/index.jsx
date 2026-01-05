import React, { useEffect, useState } from "react";
// 1. Ensure this import matches your file structure
import { getPartners } from "../../api/auth"; 

const BRAND_GRADIENT = "from-teal-500 to-teal-600";
const token = localStorage.getItem("token"); // Get token for the API call

const CarouselItem = ({ company }) => (
  <div className="flex-shrink-0 w-72 bg-[var(--color-card-bg)] rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300 flex flex-col mb-4 border border-[var(--color-border)]">
    <div className={`h-2 bg-gradient-to-r ${BRAND_GRADIENT}`}></div>
    <div className="p-6 flex-grow">
      <div className="flex items-center space-x-4">
        <img 
          src={company.logo || "https://via.placeholder.com/150"} 
          alt={company.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/20"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold truncate text-[var(--color-card-text)]">{company.name}</h4>
          <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex text-teal-500">★★★★★</div>
        <button 
          onClick={() => window.open(company.website, "_blank")}
          className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          
        >
          View Profile
        </button>
      </div>
    </div>
  </div>
);

const CompanyCarousel = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 LOAD PARTNERS PUBLICLY */
useEffect(() => {
  async function loadPartners() {
    try {
      // Calling the helper without passing any token
      const res = await getPartners(); 
      
      if (res?.status) {
        setPartners(res.partners);
      }
    } catch (error) {
      console.error("Public fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }
  loadPartners();
  console.log(partners);
}, []);

  if (loading) return <div className="text-center py-10">Loading Partners...</div>;
  if (partners.length === 0) return null;

  // Duplicate for infinite scroll effect
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <div className="relative overflow-hidden py-10 bg-gray-50/50 rounded-3xl">
      <div className="flex animate-scroll-infinite space-x-6 px-6">
        {duplicatedPartners.map((partner, index) => (
          <CarouselItem key={`${partner.id}-${index}`} company={partner} />
        ))}
      </div>
      {/* Side Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
    </div>
  );
};

export default CompanyCarousel;