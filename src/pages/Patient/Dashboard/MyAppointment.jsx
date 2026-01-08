import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  Activity, 
  Search,
  Filter,
  Download,
  Building,
  ArrowRight,
  X // Added for clearing date
} from 'lucide-react';

// --- MOCK API SERVICE (Simulating your Salesforce backend) ---
const fetchPatientAppointments = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock data structure matching your SOQL query fields:
  // Id, Name, Visit_Time__c, Date__c, Department__c, Patient__r.Name, Hospital__r.Name
  return [
    {
      Id: 'a012x00000abc1',
      Name: 'OPD-2024-8891', // Ticket Number
      Hospital__r: { Name: 'City General Hospital - Main Branch' },
      Department__c: 'Cardiology',
      Date__c: '2025-05-12',
      Visit_Time__c: '10:00 AM - 11:00 AM',
      Status__c: 'Pending', 
      Doctor_Name: 'Unassigned'
    },
    {
      Id: 'a012x00000abc2',
      Name: 'OPD-2024-8842',
      Hospital__r: { Name: 'District Civil Hospital' },
      Department__c: 'General Medicine',
      Date__c: '2025-04-28',
      Visit_Time__c: '09:00 AM - 10:00 AM',
      Status__c: 'Successful',
      Doctor_Name: 'Dr. Anita Ray'
    },
    {
      Id: 'a012x00000abc3',
      Name: 'OPD-2024-7721',
      Hospital__r: { Name: 'City General Hospital - Main Branch' },
      Department__c: 'Dermatology',
      Date__c: '2025-02-15',
      Visit_Time__c: '02:00 PM - 03:00 PM',
      Status__c: 'Successful',
      Doctor_Name: 'Dr. Robert Chen'
    },
    // Added older past ticket for testing date search
    {
      Id: 'a012x00000abc4',
      Name: 'OPD-2023-1102',
      Hospital__r: { Name: 'Community Health Center' },
      Department__c: 'Orthopedics',
      Date__c: '2023-11-10',
      Visit_Time__c: '11:00 AM - 12:00 PM',
      Status__c: 'Successful',
      Doctor_Name: 'Dr. S. Gupta'
    }
  ];
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Successful: "bg-teal-50 text-teal-700 border-teal-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      {/* Decorative accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${appointment.Status__c === 'Successful' ? 'bg-teal-500' : 'bg-amber-400'}`}></div>

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        {/* Left: Ticket & Hospital Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {appointment.Name}
            </span>
            <StatusBadge status={appointment.Status__c} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {appointment.Hospital__r.Name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin size={14} className="text-teal-600" />
            <span>Out Patient Department (OPD)</span>
          </div>
        </div>

        {/* Middle: Clinical Details */}
        <div className="flex-1 md:border-l md:border-r border-gray-100 md:px-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Department</p>
                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-700">
                    <Activity size={16} className="text-teal-500" />
                    {appointment.Department__c}
                </div>
             </div>
             <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Date</p>
                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-700">
                    <Calendar size={16} className="text-teal-500" />
                    {appointment.Date__c}
                </div>
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 min-w-[140px]">
          <button className="flex items-center justify-center gap-2 w-full py-2 bg-teal-50 text-teal-700 font-bold text-sm rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">
            <FileText size={16} />
            View Ticket
          </button>
          {appointment.Status__c === 'Successful' && (
             <button className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <Download size={16} />
                Prescription
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Upcoming, Past
  const [searchMonth, setSearchMonth] = useState(''); // State for month search

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPatientAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter Logic
  const filteredAppointments = appointments.filter(apt => {
    // 1. Month Search Priority: If a month is selected, ignore tabs
    // apt.Date__c format is YYYY-MM-DD
    // searchMonth format from input type="month" is YYYY-MM
    if (searchMonth) {
      return apt.Date__c.startsWith(searchMonth);
    }

    // 2. Tab Filters (Only active if no month selected)
    if (filter === 'All') return true;
    const aptDate = new Date(apt.Date__c);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (filter === 'Upcoming') return aptDate >= today;
    if (filter === 'Past') return aptDate < today;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your OPD tickets and hospital visits</p>
          </div>
          <button className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center gap-2">
             <Building size={18} />
             Book New Appointment
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Controls Bar: Filters & Date Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            {/* Tab Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Upcoming', 'Past'].map((f) => (
                <button
                key={f}
                onClick={() => {
                    setFilter(f);
                    setSearchMonth(''); // Clear month when tab is clicked
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filter === f && !searchMonth
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                >
                {f}
                </button>
            ))}
            </div>

            {/* Month Search Input */}
            <div className="relative group w-full md:w-auto">
                <div className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all ${searchMonth ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-gray-200'}`}>
                    <Calendar size={18} className="text-gray-400 mr-2 group-focus-within:text-teal-600 transition-colors" />
                    <input 
                        type="month"
                        value={searchMonth}
                        onChange={(e) => setSearchMonth(e.target.value)}
                        className="w-full md:w-40 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                        placeholder="Search by month"
                    />
                    {searchMonth && (
                        <button 
                          onClick={() => setSearchMonth('')}
                          className="p-1 ml-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                          title="Clear month filter"
                        >
                          <X size={14} />
                        </button>
                    )}
                </div>
            </div>

        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
             {[1,2,3].map(i => (
               <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
             ))}
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <AppointmentCard key={apt.Id} appointment={apt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-800">No appointments found</h3>
             <p className="text-gray-500 mb-6">
                {searchMonth 
                 ? `No appointments found for ${new Date(searchMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` 
                 : "You haven't booked any appointments in this category."}
             </p>
             <button 
                onClick={() => {
                    setFilter('All');
                    setSearchMonth('');
                }}
                className="text-teal-600 font-bold text-sm hover:underline"
             >
               Clear Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}