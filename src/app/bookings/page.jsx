"use client";
import React, { useState, useEffect } from "react";
import { BookingsTable } from "../components/BookingsTable";
import StatCard from "../components/StatCard";
import { getAllBookings } from "@/services/api/bookingsService";
import { FileText, CheckCircle, XCircle, CheckCheck } from "lucide-react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const userRole = sessionStorage.getItem("userRole");
      const userPlaceId = sessionStorage.getItem("placeId");

      const response = await getAllBookings();
      if (response.STS === "200" && response.CONTENT) {
        let bookings = response.CONTENT;
        
        // Filter bookings by placeId for ROLE_ADMIN users
        if (userRole === "ROLE_ADMIN" && userPlaceId) {
          bookings = bookings.filter(booking => booking.place?.id?.toString() === userPlaceId);
        }
        
        setBookings(bookings);
        
        // Calculate stats
        const total = response.CONTENT.length;
        const pending = response.CONTENT.filter(b => b.bookingStatus === "PENDING").length;
        const confirmed = response.CONTENT.filter(b => b.bookingStatus === "CONFIRMED").length;
        const active = response.CONTENT.filter(b => b.bookingStatus === "ACTIVE").length;
        const completed = response.CONTENT.filter(b => b.bookingStatus === "COMPLETED").length;
        const cancelled = response.CONTENT.filter(b => b.bookingStatus === "CANCELLED").length;
        
        setStats({ total, pending, confirmed, active, completed, cancelled });
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all bike rental bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            name="Total Bookings"
            value={stats.total}
            icon={FileText}
            bgcolor="bg-[#d8ebff]"
            color="text-blue-500"
          />
          <StatCard
            name="Active"
            value={stats.active}
            icon={CheckCircle}
            bgcolor="bg-[#e8ffd8]"
            color="text-green-500"
          />
          <StatCard
            name="Completed"
            value={stats.completed}
            icon={CheckCheck}
            bgcolor="bg-[#f4d8ff]"
            color="text-purple-500"
          />
          <StatCard
            name="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            bgcolor="bg-[#ffd8d8]"
            color="text-red-500"
          />
        </div>

        {/* Bookings Table */}
        <BookingsTable 
          initialBookings={bookings} 
          loading={loading}
          onBookingsUpdate={fetchBookings}
        />
      </div>
    </div>
  );
};

export default BookingsPage;
