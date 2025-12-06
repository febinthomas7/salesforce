import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

// Main App component
export default function Login() {
  // Mock data for the doctor list. In a real application, you would fetch this from your database.
  const doctors = [
    { id: "", name: "Select a Doctor" },
    { id: "dr_jones", name: "Dr. Jane Jones" },
    { id: "dr_smith", name: "Dr. John Smith" },
    { id: "dr_lee", name: "Dr. David Lee" },
    { id: "dr_wong", name: "Dr. Emily Wong" },
  ];

  // State variables for form inputs and UI messages
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eyePassword, setEyePassword] = useState(false);
  // Handle changes in the Doctor Name dropdown
  const handleNameChange = (e) => {
    const newId = e.target.value;
    setSelectedDoctorId(newId);
  };

  // Handle changes in the Doctor ID dropdown
  const handleIdChange = (e) => {
    const newId = e.target.value;
    setSelectedDoctorId(newId);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    // Basic validation to ensure a doctor is selected
    if (!selectedDoctorId) {
      setErrorMessage("Please select a doctor and enter your password.");
      setIsLoading(false);
      return;
    }

    // Simulate an API call with a delay
    setTimeout(() => {
      // Mock login logic. Replace this with your actual API call.
      if (selectedDoctorId === "dr_jones" && password === "password123") {
        setIsLoggedIn(true);
        setErrorMessage("");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
      setIsLoading(false);
    }, 1500); // 1.5-second delay to simulate network latency
  };

  // Render the login form or a success message based on login state
  return (
    <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] min-h-screen flex flex-col justify-center items-center p-4 text-black">
      {/* --- LOGO MOVED HERE --- */}
      <div className="flex justify-center mb-6 ">
        <img src="/home-logo.png" alt="App Logo" className="w-26 h-24" />
      </div>
      {/* --- END OF LOGO SECTION --- */}

      <div className="w-full max-w-md p-8 m-4 space-y-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to the portal.
          </p>
        </div>

        {isLoggedIn ? (
          // Success message after successful login
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-600">
              Login Successful!
            </h3>
            <p className="mt-2">Welcome back!</p>
          </div>
        ) : (
          // Login form
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Dropdown for Doctor Name */}
            <div>
              <label
                htmlFor="doctorName"
                className="block text-sm font-medium text-gray-700"
              >
                Doctor Name
              </label>
              <div className="mt-1">
                <select
                  id="doctorName"
                  name="doctorName"
                  required
                  value={selectedDoctorId}
                  onChange={handleNameChange}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropdown for Doctor ID */}
            <div>
              <label
                htmlFor="doctorId"
                className="block text-sm font-medium text-gray-700"
              >
                Doctor ID
              </label>
              <div className="mt-1">
                <select
                  id="doctorId"
                  name="doctorId"
                  required
                  value={selectedDoctorId}
                  onChange={handleIdChange}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input field for Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={eyePassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute right-3 top-3 z-10">
                  {eyePassword ? (
                    <Eye
                      onClick={() => setEyePassword(!eyePassword)}
                      className=" h-5 w-5 text-gray-400 cursor-pointer"
                    />
                  ) : (
                    <EyeClosed
                      onClick={() => setEyePassword(!eyePassword)}
                      className=" h-5 w-5 text-gray-400 cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Display error message if present */}
            {errorMessage && (
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            )}

            {/* Submit button with loading indicator */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full justify-center rounded-md border border-transparent bg-gradient-to-br from-[#8FBEB9] to-[#7FB0A8] py-2 px-4 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#8FBEB9] focus:ring-offset-2 ${
                  isLoading ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {isLoading ? "Logging in..." : "Sign in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
