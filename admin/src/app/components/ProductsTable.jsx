"use client";

import { motion } from "framer-motion";
import { Search, Edit, Trash2, Save } from "lucide-react";
import productData from "../../../public/data/data.json";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const ProductsTable = () => {
  const [products, setProducts] = useState(productData.productData);
  const [searchTerms, setSearchTerm] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  // Correct search filter (name OR category OR id)
  const filteredProducts = useMemo(() => {
    if (!searchTerms) return products;
    const lower = searchTerms.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.id && p.id.toLowerCase().includes(lower))
    );
  }, [searchTerms, products]);

  // Start edit: copy current row into editedValues (strings for inputs)
  const handelEditClick = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingRow(id);
    setEditedValues({
      ...p,
      // convert to strings so inputs are controlled strings
      price: p.price != null ? String(p.price) : "",
      stock: p.stock != null ? String(p.stock) : "",
      sales: p.sales != null ? String(p.sales) : "",
    });
  };

  // Save: convert numeric fields back to numbers before saving into products
  const handelSaveClick = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        // convert numeric fields safely
        const priceNum =
          editedValues.price === "" ? 0 : parseFloat(editedValues.price);
        const stockNum =
          editedValues.stock === "" ? 0 : parseInt(editedValues.stock, 10);
        const salesNum =
          editedValues.sales === "" ? 0 : parseInt(editedValues.sales, 10);

        return {
          ...p,
          // copy edited textual fields (if you allowed editing name/category, etc.)
          name: editedValues.name ?? p.name,
          category: editedValues.category ?? p.category,
          image: editedValues.image ?? p.image,
          // numeric fields forced to number types
          price: Number.isFinite(priceNum) ? priceNum : p.price,
          stock: Number.isFinite(stockNum) ? stockNum : p.stock,
          sales: Number.isFinite(salesNum) ? salesNum : p.sales,
        };
      })
    );

    setEditingRow(null);
    setEditedValues({});
  };

  // Delete handler (optimistic UI)
  const handelDelete = (id) => {
    // confirm with the user
    const ok = window.confirm(
      "Delete this bike? This action cannot be undone."
    );
    if (!ok) return;

    // Optimistically remove from UI
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // If that row was being edited, clear edit state
    if (editingRow === id) {
      setEditingRow(null);
      setEditedValues({});
    }
  };

  // change handler for edit inputs (keeps values as strings)
  const handelChange = (field, value) => {
    // allow empty (so user can clear before typing)
    // price: allow decimals, stock/sales: integers only
    if (field === "price") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    } else if (field === "stock" || field === "sales") {
      if (!/^\d*$/.test(value)) return;
    }

    setEditedValues((prev) => ({ ...prev, [field]: value }));
  };

  // safe price formatter to avoid toFixed errors
  const formatPrice = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? `₹${n.toFixed(2)}` : "₹0.00";
  };

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100 text-center md:text-left">
          Product List
        </h2>

        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search Bikes..."
            value={searchTerms}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-10 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gray-50 transition duration-200 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {[
                "Name",
                "Bike ID",
                "Category",
                "Price/hr",
                "Available",
                "Rentals",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {filteredProducts.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className={`flex flex-col md:table-row border-b md:border-b-0 border-gray-700 md:border-none p-2 md:p-0 ${
                  editingRow === product.id ? "bg-[#2f2f2f]" : ""
                }`}
              >
                {/* Mobile view (simplified info block) */}
                <td className="md:hidden px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-100">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID:{product.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1 -mt-1 -mr-1">
                      <button
                        className="text-indigo-500 hover:text-indigo-300"
                        aria-label={
                          editingRow === product.id ? "Save" : "Edit bike"
                        }
                        onClick={() =>
                          editingRow === product.id
                            ? handelSaveClick(product.id)
                            : handelEditClick(product.id)
                        }
                      >
                        {editingRow === product.id ? (
                          <Save size={16} />
                        ) : (
                          <Edit size={16} />
                        )}
                      </button>
                      <button
                        className="text-red-500 hover:text-red-300"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => handelDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    <div>Category: {product.category}</div>

                    {/* mobile fields — show inputs while editing */}
                    {["price", "stock", "sales"].map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between"
                      >
                        <span className="capitalize">{field}:</span>
                        {editingRow === product.id ? (
                          <input
                            inputMode={
                              field === "price" ? "decimal" : "numeric"
                            }
                            pattern={
                              field === "price" ? "^\\d*\\.?\\d*$" : "^\\d*$"
                            }
                            className="bg-transparent text-white border border-gray-400 w-20 text-center ml-2 text-sm"
                            value={
                              editedValues[field] ?? String(product[field])
                            }
                            onChange={(e) =>
                              handelChange(field, e.target.value)
                            }
                          />
                        ) : field === "price" ? (
                          formatPrice(product.price)
                        ) : (
                          product[field]
                        )}
                      </div>
                    ))}
                  </div>
                </td>

                {/* Desktop view */}
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <div className="flex items-center">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={36}
                      height={36}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-4">{product.name}</div>
                  </div>
                </td>

                <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                  {product.id}
                </td>

                <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                  {product.category}
                </td>

                {/* Editable desktop fields */}
                {["price", "stock", "sales"].map((field) => (
                  <td
                    key={field}
                    className="hidden md:table-cell px-6 py-4 text-sm text-gray-300"
                  >
                    {editingRow === product.id ? (
                      <input
                        inputMode={field === "price" ? "decimal" : "numeric"}
                        pattern={
                          field === "price" ? "^\\d*\\.?\\d*$" : "^\\d*$"
                        }
                        className="bg-transparent text-white border border-gray-400 w-20 text-center"
                        value={editedValues[field] ?? String(product[field])}
                        onChange={(e) => handelChange(field, e.target.value)}
                      />
                    ) : field === "price" ? (
                      formatPrice(product.price)
                    ) : (
                      product[field]
                    )}
                  </td>
                ))}

                {/* Actions desktop */}
                <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-300">
                  <div className="flex space-x-1 -ml-2">
                    {editingRow === product.id ? (
                      <button
                        className="text-green-500 hover:text-green-300 mr-1 cursor-pointer"
                        aria-label="Save bike"
                        onClick={() => handelSaveClick(product.id)}
                      >
                        <Save size={18} />
                      </button>
                    ) : (
                      <button
                        className="text-indigo-500 hover:text-indigo-300 mr-1 cursor-pointer"
                        aria-label="Edit bike"
                        onClick={() => handelEditClick(product.id)}
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    <button
                      className="text-red-500 hover:text-red-300 cursor-pointer"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => handelDelete(product.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ProductsTable;
