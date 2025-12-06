import { useState } from "react";
import { registerUser, loginUser } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";

export default function Login() {
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  const [eyeLogin, setEyeLogin] = useState(false);
  const [eyeSignup, setEyeSignup] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  // SIGNUP HANDLER
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoadingSignup(true);

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

      if (data.status === true) {
        setMessage({
          text: "Registration successful! You can now log in.",
          type: "success",
        });

        e.target.reset();

        setTimeout(() => {
          setIsLogin(true);
          setMessage({ text: "", type: "" });
        }, 1500);
      } else {
        setMessage({
          text: data.error[0].errorCode || "Registration failed",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Registration failed",
        type: "error",
      });
    } finally {
      setLoadingSignup(false);
    }
  };

  // LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);

    const formData = new FormData(e.target);
    const credentials = {
      adhaar_no: formData.get("login-aadhaar"),
      password: formData.get("login-password"),
    };

    try {
      const data = await loginUser(credentials);
      if (data.status === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "patient");
        localStorage.setItem("patient", JSON.stringify(data.data));

        setMessage({ text: "Login successful!", type: "success" });

        e.target.reset();

        setTimeout(() => {
          navigate("/patient/dashboard");
        }, 800);
      } else {
        setMessage({
          text: "Invalid Credentials",
          type: "error",
        });
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
      <div className="flex justify-center mb-6">
        <img src="/home-logo.png" alt="App Logo" className="w-26 h-24" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage({ text: "", type: "" });
            }}
            className={`w-1/2 py-2 px-4 text-center font-semibold transition-colors border-b-2 ${
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
            className={`w-1/2 py-2 px-4 text-center font-semibold transition-colors border-b-2 ${
              !isLogin
                ? "text-gray-700 border-[#6B9E99]"
                : "text-gray-400 border-transparent hover:text-[#6B9E99]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN FORM */}
        {isLogin ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Login with Aadhaar
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="login-aadhaar"
                  placeholder="Enter your 12-digit Aadhaar number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                  pattern="[0-9]{12}"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={eyeLogin ? "text" : "password"}
                  name="login-password"
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                />
                <div className="absolute right-3 top-9 cursor-pointer">
                  {eyeLogin ? (
                    <Eye
                      onClick={() => setEyeLogin(false)}
                      className="h-5 w-5 text-gray-400"
                    />
                  ) : (
                    <EyeClosed
                      onClick={() => setEyeLogin(true)}
                      className="h-5 w-5 text-gray-400"
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
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-2 px-4 rounded-lg text-white bg-[#7DB1AD] hover:bg-[#6B9E99] flex justify-center items-center"
              >
                {loadingLogin ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* SIGNUP FORM */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Create an Account
            </h2>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="signup-name"
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="signup-phone"
                  placeholder="Enter your phone number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gmail Address
                </label>
                <input
                  type="email"
                  name="signup-gmail"
                  placeholder="Enter your Gmail address"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="signup-aadhaar"
                  placeholder="Enter your 12-digit Aadhaar number"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                  pattern="[0-9]{12}"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Create Password
                </label>
                <input
                  type={eyeSignup ? "text" : "password"}
                  name="signup-password"
                  placeholder="Create a strong password"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm"
                  required
                  minLength="8"
                />
                <div className="absolute right-3 top-9 cursor-pointer">
                  {eyeSignup ? (
                    <Eye
                      onClick={() => setEyeSignup(false)}
                      className="h-5 w-5 text-gray-400"
                    />
                  ) : (
                    <EyeClosed
                      onClick={() => setEyeSignup(true)}
                      className="h-5 w-5 text-gray-400"
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
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingSignup}
                className="w-full py-2 px-4 rounded-lg text-white bg-[#7DB1AD] hover:bg-[#6B9E99] flex justify-center items-center"
              >
                {loadingSignup ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
