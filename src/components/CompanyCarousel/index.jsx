import React from "react";

// Single color constant as requested
const BRAND_GRADIENT = "from-teal-500 to-teal-600";

const CarouselItem = ({ company, index }) => {
  const handleViewWebsite = (e) => {
    e.stopPropagation();
    if (company.website) {
      window.open(company.website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      key={`${company.id}-${index}`}
      className="flex-shrink-0 w-72 bg-[var(--color-card-bg)] rounded-xl shadow-[var(--color-shadow)] overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl flex flex-col mb-4"
    >
      {/* Exact original height for top bar */}
      <div className={`h-2 bg-gradient-to-r ${BRAND_GRADIENT}`}></div>
      
      {/* Exact original p-6 padding */}
      <div className="p-6 flex-grow">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-16 h-16 rounded-full object-cover border-4 border-[var(--color-border)] shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-[var(--color-card-text)] truncate">
              {company.name}
            </h4>
            <p className="text-sm text-[var(--color-card-secondary-text)] mt-1 leading-relaxed line-clamp-2">
              {company.description}
            </p>
          </div>
        </div>

        {/* Bottom row: Stars + Eye Icon */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-[var(--color-primary)] fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L0 6.91l6.564-.954L10 0l3.436 5.956L20 6.91l-5.245 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          
          {/* Clicking this eye opens the website */}
          <button 
            onClick={handleViewWebsite}
            className="text-[var(--color-primary)] hover:scale-110 transition-transform p-1"
            title="View Website"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CompanyCarousel = () => {
  // Expanded list with 10 companies
  const companies = [
    { id: "sf-01", name: "MediTech Solutions", description: "Advanced Health Technology", logo: "https://images.pexels.com/photos/10360340/pexels-photo-10360340.jpeg?w=200", website: "https://meditech.com" },
    { id: "sf-02", name: "LifeCare Pharmacy", description: "Community & Clinical Pharmacy", logo: "https://images.pexels.com/photos/4047192/pexels-photo-4047192.jpeg?w=200", website: "https://lifecare.com" },
    { id: "sf-03", name: "HealthMetrics Research", description: "Medical Data & Analytics", logo: "https://images.pexels.com/photos/3845667/pexels-photo-3845667.jpeg?w=200", website: "https://hmetrics.io" },
    { id: "sf-04", name: "Wellness Connect", description: "Mental Health & Teletherapy", logo: "https://images.pexels.com/photos/42262/doctor-healthcare-pharmaceutical-medicine-42262.jpeg?w=200", website: "https://wconnect.com" },
    { id: "sf-05", name: "BioGen Lab", description: "Pathology & Diagnostics", logo: "https://images.pexels.com/photos/3845129/pexels-photo-3845129.jpeg?w=200", website: "https://biogen.com" },
    { id: "sf-06", name: "Family Clinic", description: "Primary Care & Pediatrics", logo: "https://images.pexels.com/photos/4167540/pexels-photo-4167540.jpeg?w=200", website: "https://familyclinic.com" },
    { id: "sf-07", name: "Innovate Medical", description: "Surgical Equipment & Devices", logo: "https://images.pexels.com/photos/258447/pexels-photo-258447.jpeg?w=200", website: "https://innovatemed.com" },
    { id: "sf-08", name: "CarePlus Insurance", description: "Healthcare Insurance Plans", logo: "https://images.pexels.com/photos/5606611/pexels-photo-5606611.jpeg?w=200", website: "https://careplus.com" },
    { id: "sf-09", name: "NeuroCenter", description: "Neurology & Brain Research", logo: "https://images.pexels.com/photos/3952131/pexels-photo-3952131.jpeg?w=200", website: "https://neuro.com" },
    { id: "sf-10", name: "VisionCare", description: "Ophthalmology & Eye Surgery", logo: "https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?w=200", website: "https://vision.org" },
  ];

  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Exact original p-6 padding for container */}
      <div className="relative overflow-hidden bg-[var(--color-card-bg)] backdrop-blur-sm rounded-2xl p-6 shadow-[var(--color-shadow)] border-[var(--color-border)]">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-[var(--color-card-text)] mb-2">
            Our Trusted Healthcare Partners
          </h3>
          <p className="text-[var(--color-card-secondary-text)] text-sm">
            Working together for your well-being
          </p>
        </div>

        <div className="relative overflow-hidden pb-4"> {/* pb-4 ensures hover scale isn't cut off */}
          <div className="flex animate-scroll-infinite space-x-6">
            {duplicatedCompanies.map((company, index) => (
              <CarouselItem
                key={`${company.id}-${index}`}
                company={company}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Original side gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--color-card-bg)] to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--color-card-bg)] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CompanyCarousel;