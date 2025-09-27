import React from "react";

const Maintenance = () => {
  return (
    <div className="flex items-center justify-center max-w-7xl p-4">
      <div className="w-full bg-white rounded-xl shadow-2xl p-8">
        <main className="w-full">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 tracking-wide">
              Maintenance
            </h2>
          </div>
          {/* Placeholder for chart or table of most popular bikes */}
          <div className="p-6 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-600 text-xl font-medium">Coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Maintenance;
