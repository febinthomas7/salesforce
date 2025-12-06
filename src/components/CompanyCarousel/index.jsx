import React from "react";

// A new, dedicated component for a single carousel item.
const CarouselItem = ({ company, index }) => {
  return (
    <div
      key={`${company.id}-${index}`}
      className="flex-shrink-0 w-72 bg-[var(--color-card-bg)] rounded-xl shadow-[var(--color-shadow)] overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
    >
      <div className={`h-2 bg-gradient-to-r ${company.color}`}></div>
      <div className="p-6">
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
            <p className="text-sm text-[var(--color-card-secondary-text)] mt-1 leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-[var(--color-primary)] fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L0 6.91l6.564-.954L10 0l3.436 5.956L20 6.91l-5.245 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-[var(--color-card-secondary-text)] font-medium">
            Trusted Partner
          </span>
        </div>
      </div>
    </div>
  );
};

const CompanyCarousel = () => {
  const companies = [
    {
      id: 1,
      name: "MediTech Solutions",
      description: "Advanced Health Technology",
      logo: "https://images.pexels.com/photos/10360340/pexels-photo-10360340.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      name: "LifeCare Pharmacy",
      description: "Community & Clinical Pharmacy",
      logo: "https://images.pexels.com/photos/4047192/pexels-photo-4047192.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      name: "HealthMetrics Research",
      description: "Medical Data & Analytics",
      logo: "https://images.pexels.com/photos/3845667/pexels-photo-3845667.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 4,
      name: "Wellness Connect",
      description: "Mental Health & Teletherapy",
      logo: "https://images.pexels.com/photos/42262/doctor-healthcare-pharmaceutical-medicine-42262.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-red-500 to-red-600",
    },
    {
      id: 5,
      name: "BioGen Lab",
      description: "Pathology & Diagnostics",
      logo: "https://images.pexels.com/photos/3845129/pexels-photo-3845129.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 6,
      name: "Family Clinic Network",
      description: "Primary Care & Pediatrics",
      logo: "https://images.pexels.com/photos/4167540/pexels-photo-4167540.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-teal-500 to-teal-600",
    },
    {
      id: 7,
      name: "Innovate Medical",
      description: "Surgical Equipment & Devices",
      logo: "https://images.pexels.com/photos/258447/pexels-photo-258447.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: 8,
      name: "CarePlus Insurance",
      description: "Healthcare Insurance Plans",
      logo: "https://images.pexels.com/photos/5606611/pexels-photo-5606611.jpeg?auto=compress&cs=tinysrgb&w=200&h=200",
      color: "from-gray-500 to-gray-600",
    },
  ];

  // Duplicate the companies array to create seamless infinite scroll
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden bg-[var(--color-card-bg)] backdrop-blur-sm rounded-2xl p-6 shadow-[var(--color-shadow)] border-[var(--color-border)]">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-[var(--color-card-text)] mb-2">
            Our Trusted Healthcare Partners
          </h3>
          <p className="text-[var(--color-card-secondary-text)] text-sm">
            Working together for your well-being
          </p>
        </div>

        <div className="relative overflow-hidden">
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

        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--color-card-bg)] to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--color-card-bg)] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CompanyCarousel;