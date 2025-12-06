import { useState } from "react";
import { registerUser, loginUser } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";

export default function Login() {
  const [eyePassword, setEyePassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
      name: formData.get("signup-name"),
      phone_no: formData.get("signup-phone"),
      gmail: formData.get("signup-gmail"),
      adhaar_no: formData.get("signup-aadhaar"),
      password: formData.get("signup-password"),
    };

    try {
      const data = await registerUser(userData);

      // console.log("Registration successful:", data);
      // Registration successful
      if (data.status === true) {
        setMessage({
          text: "Registration successful! You can now log in.",
          type: "success",
        });
        e.target.reset(); // Reset form fields

        setTimeout(() => {
          setIsLogin(true); // Redirect to login
          setMessage({ text: "", type: "" });
        }, 2000);
      } else {
        setMessage({ text: "Registration failed", type: "error" });
      }
    } catch (error) {
      console.error("Signup failed:", error);

      // Axios errors can be in error.response.data
      setMessage({
        text: error.response?.data?.error || "Registration failed",
        type: "error",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const credentials = {
      adhaar_no: formData.get("login-aadhaar"),
      password: formData.get("login-password"),
    };

    try {
      const data = await loginUser(credentials);
      if (data.status === true) {
        // Save JWT token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "patient");
        // Optionally save patient info
        localStorage.setItem("patient", JSON.stringify(data.data));

        setMessage({ text: "Login successful!", type: "success" });
        e.target.reset();

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/patient/dashboard"); // or wherever you want
        }, 1000);
      } else {
        setMessage({ text: "Invalid Credentials", type: "error" });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage({
        text: error.response?.data?.error || "try again later",
        type: "error",
      });
    }
  };
  return (
    <div className="bg-gradient-to-r from-[#0b4f4a] via-[#1a756f] to-[#2a9b94] min-h-screen flex flex-col justify-center items-center p-4 text-black">
      {/* --- LOGO MOVED HERE --- */}
      <div className="flex justify-center mb-6 ">
        <img src="/home-logo.png" alt="App Logo" className="w-26 h-24" />
      </div>
      {/* --- END OF LOGO SECTION --- */}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage({ text: "", type: "" });
            }}
            className={`w-1/2 py-2 px-4 text-center font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${
              isLogin
                ? "text-gray-700 border-[#6B9E99]"
                : "text-gray-400 border-transparent hover:text-[#6B9E99]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage({ text: "", type: "" });
            }}
            className={`w-1/2 py-2 px-4 text-center font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${
              !isLogin
                ? "text-gray-700 border-[#6B9E99]"
                : "text-gray-400 border-transparent hover:text-[#6B9E99]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Conditional Rendering of Forms */}
        {isLogin ? (
          // Login Form
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Login with Aadhaar
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-aadhaar"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  id="login-aadhaar"
                  name="login-aadhaar"
                  placeholder="Enter your 12-digit Aadhaar number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                  pattern="[0-9]{12}"
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
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
                <div className="absolute right-3 top-9 z-10">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7DB1AD] hover:bg-[#6B9E99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7DB1AD] transition-colors duration-200"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          // Signup Form
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Create an Account
            </h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  name="signup-name"
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="signup-phone"
                  name="signup-phone"
                  placeholder="Enter your phone number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-gmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gmail Address
                </label>
                <input
                  type="email"
                  id="signup-gmail"
                  name="signup-gmail"
                  placeholder="Enter your Gmail address"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-aadhaar"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  id="signup-aadhaar"
                  name="signup-aadhaar"
                  placeholder="Enter your 12-digit Aadhaar number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                  pattern="[0-9]{12}"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Create Password
                </label>
                <input
                  type={eyePassword ? "text" : "password"}
                  id="signup-password"
                  name="signup-password"
                  placeholder="Create a strong password"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                  minLength="8"
                />
                <div className="absolute right-3 top-9 z-10">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7DB1AD] hover:bg-[#6B9E99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7DB1AD] transition-colors duration-200"
              >
                Sign Up
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
