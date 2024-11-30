import React, { useCallback } from "react";
import { useForm } from "react-hook-form";

const SearchBar = React.memo(({ onSearch, activeTab, setActiveTab }) => {
  const { register } = useForm();

  const handleChange = useCallback(
    (event) => {
      onSearch(event.target.value);
    },
    [onSearch]
  );

  return (
    <div>
      <div className="relative h-[400px] bg-gradient-to-r from-sky-900 to-sky-700 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Find Your Perfect Consultant
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Expert guidance tailored to your needs
          </p>
          <form className="flex justify-center mb-4">
            <div className="relative w-full max-w-2xl mx-4">
              <input
                {...register("searchQuery")}
                type="text"
                placeholder="Search consultants or services..."
                className="w-full p-4 pl-6 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg"
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-sky-950 text-white px-6 py-2 rounded-full hover:bg-sky-800 transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-center -mt-6 relative z-20 w-full px-4">
        <div className="bg-white rounded-full shadow-lg p-1 w-full max-w-[320px]">
          <div className="grid grid-cols-2 gap-1">
            <button
              className={`py-2 rounded-full transition-colors duration-200 ${
                activeTab === "consultants"
                  ? "bg-sky-950 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("consultants")}
            >
              Consultants
            </button>
            <button
              className={`py-2 rounded-full transition-colors duration-200 ${
                activeTab === "services"
                  ? "bg-sky-950 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("services")}
            >
              Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SearchBar;
