import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { loginDoctor } from "../../../api/auth";
import { useNavigate } from "react-router-dom";

// Main App component
export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [eyePassword, setEyePassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const credentials = {
      doctor_id: formData.get("doctorId"),
      password: formData.get("password"),
    };

    try {
      const data = await loginDoctor(credentials);
      if (data.status === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "doctor");
        localStorage.setItem("dashboardName", data.name);

        localStorage.setItem("doctor", JSON.stringify(data.data));

        setMessage({ text: "Login successful!", type: "success" });

        e.target.reset();

        setTimeout(() => {
          navigate("/doctor/dashboard");
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
      setIsLoading(false);
    }
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

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="doctorId"
              className="block text-sm font-medium text-gray-700"
            >
              Doctor ID
            </label>
            <div className="mt-1 relative">
              <input
                id="doctorId"
                name="doctorId"
                type="text"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your Id"
              />
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

          {/* Submit button with loading indicator */}
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
