import React from "react";

const AddProducts = () => {
  return (
    <div className="mt-8 p-6 bg-white rounded-xl max-w-7xl shadow-sm">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-gray-800">
          Create Product  
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1 - Basic Info */}
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">
            Basic Information
          </h3>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                className="mt-1 px-3 py-2 border rounded-lg text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Product Code
              </label>
              <input
                type="text"
                placeholder="Enter product code"
                className="mt-1 px-3 py-2 border rounded-lg text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                className="mt-1 px-3 py-2 border rounded-lg text-gray-700 min-h-[100px]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 2 - Image & Attributes */}
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">
            Product Image
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Choose a product photo or drag and drop it here
          </p>

          <div className="flex items-center justify-center w-full mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 text-gray-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4m0 0l-4 4m4-4l4 4m6 0v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                <p className="text-sm text-gray-500">Click or Drag & Drop</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>

          {/* Attributes */}
          <div className="mt-6 mb-[80px]">
            <h3 className="text-md font-semibold text-gray-700 mb-3">
              Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Category
                </label>
                <select className="mt-1 px-3 py-2 border rounded-lg text-gray-700 w-full">
                  <option>Select Category</option>
                  <option>Sports Bike</option>
                  <option>Scooter</option>
                  <option>Cruise Bike</option>
                  <option>Electric</option>
                  <option>CNG</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Brand
                </label>
                <input
                  type="text"
                  placeholder="Enter brand"
                  className="mt-1 px-3 py-2 border rounded-lg text-gray-700 w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="mt-1 px-3 py-2 border rounded-lg text-gray-700 w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Stock
                </label>
                <input
                  type="number"
                  placeholder="Enter stock quantity"
                  className="mt-1 px-3 py-2 border rounded-lg text-gray-700 w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Color
                </label>
                <input
                  type="text"
                  placeholder="Enter color"
                  className="mt-1 px-3 py-2 border rounded-lg text-gray-700 w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <select className="mt-1 mb-2 px-3 py-2 border rounded-lg text-gray-700 w-full">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6 gap-4">
        <button className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">
          Cancel
        </button>
        <button className="px-5 py-2 bg-[#f43d3a] text-white rounded-lg hover:bg-[#f40e0a] transition">
          Save Product
        </button>
      </div>
    </div>
  );
};

export default AddProducts;
