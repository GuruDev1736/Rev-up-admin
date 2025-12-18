"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BikeRequestsTable from "../components/BikeRequestsTable";
import { getAllBikeRequests } from "@/services/api/bikeRequestService";

export default function BikeRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBikeRequests();

      if (response.success) {
        setRequests(response.requests);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching bike requests:", err);
      setError("Failed to load bike requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestsUpdate = () => {
    fetchRequests();
  };

  return (
    <div className="p-6 lg:p-8">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading bike requests</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <BikeRequestsTable
          initialRequests={requests}
          loading={loading}
          onRequestsUpdate={handleRequestsUpdate}
        />
      )}
    </div>
  );
}
