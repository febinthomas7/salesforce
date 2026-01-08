import { Eye, EyeClosed, CheckCircle, LayoutDashboard } from "lucide-react";
import { useState } from "react";

// --- MOCK API FUNCTION (For Preview Purposes) ---
// In your actual project, replace this function with:
// import { loginReceptionist } from "../../../api/auth";
const loginReceptionist = async (credentials) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate simple validation
  if (credentials.receptionist_id && credentials.password) {
    return {
      status: true,
      token: "mock-receptionist-token-123",
      name: "Main Desk Receptionist"
    };
  }
  return { status: false };
};

// Main Receptionist Login Component
export default function ReceptionistLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [eyePassword, setEyePassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Navigation State (Replaces useNavigate for Preview)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardName, setDashboardName] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const credentials = {
      receptionist_id: formData.get("receptionistId"),
      password: formData.get("password"),
    };

    try {
      const data = await loginReceptionist(credentials);
      
      if (data.status === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "receptionist");
        localStorage.setItem("dashboardName", data.name);
        setDashboardName(data.name);

        setMessage({ text: "Login successful! Redirecting...", type: "success" });

        // Simulate Navigation Delay
        setTimeout(() => {
          setIsLoggedIn(true);
        }, 800);
      } else {
        setMessage({
          text: "Invalid Credentials",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage({
        text: "Server Error or Invalid Credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- DASHBOARD VIEW (Shown after login in Preview) ---
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600 mb-4">
            <LayoutDashboard size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {dashboardName}</h2>
          <p className="text-gray-500">You have successfully logged in.</p>
          <div className="p-4 bg-teal-50 text-teal-700 text-sm rounded-lg font-medium border border-teal-100">
             Redirecting to Dashboard Route...
             <br/>
             <span className="text-xs opacity-75">(/receptionist/dashboard)</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-gray-400 hover:text-gray-600 underline mt-4"
          >
            Log Out / Reset Preview
          </button>
        </div>
      </div>
    );
  }

  // --- LOGIN FORM VIEW ---
  return (
    <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] min-h-screen flex flex-col justify-center items-center p-4 text-black font-sans">
      {/* --- LOGO SECTION --- */}
      <div className="flex justify-center mb-8">
        <img src="/home-logo.png" alt="App Logo" className="w-26 h-24" />
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reception Portal</h2>
          <p className="mt-2 text-sm text-gray-500">
            Secure login for hospital staff
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Input field for Receptionist ID */}
          <div>
            <label
              htmlFor="receptionistId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Receptionist ID
            </label>
            <div className="relative">
              <input
                id="receptionistId"
                name="receptionistId"
                type="text"
                required
                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm transition-all"
                placeholder="REC-001"
              />
            </div>
          </div>

          {/* Input field for Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={eyePassword ? "text" : "password"}
                required
                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm transition-all"
                placeholder="••••••••"
              />
              <div className="absolute right-3 top-3.5 z-10">
                {eyePassword ? (
                  <Eye
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-gray-400 cursor-pointer hover:text-teal-600 transition-colors"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-gray-400 cursor-pointer hover:text-teal-600 transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message.type === 'success' && <CheckCircle size={16}/>}
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md border border-transparent bg-gradient-to-br from-[#8FBEB9] to-[#7FB0A8] py-2 px-4 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#8FBEB9] focus:ring-offset-2 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}