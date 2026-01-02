import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { loginHospital } from "../../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [eyePassword, setEyePassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    const formData = new FormData(e.target);

    const credentials = {
      npi_id: formData.get("login-npi-id"),
      password: formData.get("login-password"),
    };

    try {
      const data = await loginHospital(credentials);

      if (data.status === true) {
        // Save JWT token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "hospital");
        // Save hospital/patient info
        localStorage.setItem("patient", JSON.stringify(data.data));

        setMessage({ text: "Login successful!", type: "success" });
        e.target.reset();

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/hospital/dashboard");
        }, 1000);
      } else {
        setMessage({ text: "Invalid Credentials", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Invalid Credentials",
        type: "error",
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] min-h-screen flex flex-col justify-center items-center p-4 text-black">
      {/* App Logo */}
      <div className="flex justify-center mb-6">
        <img src="/home-logo.png" alt="App Logo" className="w-26 h-24" />
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Login Form Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Login with NPI ID
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-npi-id"
                className="block text-sm font-medium text-gray-700"
              >
                NPI ID
              </label>
              <input
                type="text"
                id="login-npi-id"
                name="login-npi-id"
                placeholder="Enter your NPI ID"
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#7DB1AD] focus:border-[#7DB1AD] transition-colors duration-200"
                required
              />
            </div>
            
            <div className="relative">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type={eyePassword ? "text" : "password"}
                id="login-password"
                name="login-password"
                placeholder="Enter your password"
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#7DB1AD] focus:border-[#7DB1AD] transition-colors duration-200"
                required
              />
              <div className="absolute right-3 top-8 z-10">
                {eyePassword ? (
                  <Eye
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                  />
                ) : (
                  <EyeClosed
                    onClick={() => setEyePassword(!eyePassword)}
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-2 px-4 rounded-lg text-white bg-[#7DB1AD] hover:bg-[#6B9E99] flex justify-center items-center transition-colors duration-200"
            >
              {loadingLogin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}