import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// Assuming other necessary imports are here (Link, Icons, etc.)

import { LogOut, User } from "lucide-react";

function Sidebar({ navigation, toggleSidebar, isCollapsed, name }) {
  // 1. State to manage the sidebar's collapsed state
  //   const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // 2. Function to toggle the state

  const Logout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  // Define Tailwind classes based on the state
  const sidebarWidthClass = isCollapsed ? "w-0 sm:lg:w-20" : "lg:w-64";
  const logoTextVisibility = isCollapsed ? "hidden" : "inline";
  const navItemTextVisibility = isCollapsed ? "hidden" : "block";
  const userInfoVisibility = isCollapsed ? "hidden" : "flex";

  return (
    <div
      className={`fixed right-0 z-30 bg-white h-full  lg:inset-y-0 sm:relative sm:left-0 flex ${sidebarWidthClass} lg:flex-col transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col flex-grow bg-[var(--color-bg-2)] border-r border-gray-200 shadow-sm">
        {/* Header/Logo Section */}
        <div className="flex h-16 items-center px-4 border-b border-gray-200 justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${logoTextVisibility}`}>
              <img src="/logo.png" className="h-10 w-9" alt="MedLock Logo" />
            </div>
            <h1
              className={`text-xl font-bold text-[var(--text-color)] ${logoTextVisibility} transition-opacity duration-300`}
            >
              Medlock
            </h1>
          </div>

          {/* 4. Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full text-[var(--icon-color)] hover:bg-[var(--nav-button-hover-bg)] transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {/* You might want a custom icon for collapsing, like ChevronLeftIcon or MenuFoldLeftIcon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-6 w-6 transform transition-transform duration-300 ${
                isCollapsed ? "rotate-0" : "rotate-180"
              }`}
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="  border-b flex gap-2  border-gray-200 p-3">
          {" "}
          <div
            className={`bg-[#d1e8e5] p-3 w-fit  rounded-full border border-transparent`}
          >
            <User className={`h-5 w-5 `} />
          </div>
          <div
            className={`${userInfoVisibility} transition-opacity duration-300 flex flex-col`}
          >
            <span className="text-sm font-bold">Name</span>
            <span className="text-sm">{name}</span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 fade-in">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center p-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? " bg-[var(--color-hover)] text-[var(--color-text)] "
                    : " hover:bg-[var(--color-hover)] text-[var(--color-text)] "
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                {/* Icon is always visible */}
                <item.icon
                  className={`h-5 w-5 ${isCollapsed ? "mr-0" : "mr-3"}`}
                />
                {/* Text is conditionally visible */}
                <span
                  className={`${navItemTextVisibility} transition-opacity duration-300`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User info / Theme Toggle / Logout */}
        <div className="border-t border-gray-200 p-4">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* Logout Button */}
            <button
              onClick={Logout}
              className={`text-[var(--icon-color)] flex gap-2 justify-center items-center cursor-pointer hover:text-[var(--icon-hover-color)] transition-colors ${
                isCollapsed ? "" : "ml-2"
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />

              <span
                className={`${navItemTextVisibility} transition-opacity duration-300`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
