"use client";
import React, { useState, useEffect } from "react";
import { BookingsTable } from "../components/BookingsTable";
import StatCard from "../components/StatCard";
import { getAllBookings, getBookingsByPlace } from "@/services/api/bookingsService";
import { getAllBikes } from "@/services/api/bikesService";
import { FileText, CheckCircle, XCircle, Bike, DollarSign } from "lucide-react";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBikes: 0,
    totalBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    totalPayment: 0,
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const userRole = sessionStorage.getItem("userRole");
      const userPlaceId = sessionStorage.getItem("placeId");

      let response;
      // Use place-specific API for ROLE_ADMIN users
      if (userRole === "ROLE_ADMIN" && userPlaceId) {
        response = await getBookingsByPlace(userPlaceId);
      } else {
        response = await getAllBookings();
      }

      // Fetch bikes data
      const bikesResponse = await getAllBikes();
      let bikesCount = 0;
      
      if (bikesResponse.success && bikesResponse.bikes) {
        // Filter bikes by place for ROLE_ADMIN
        if (userRole === "ROLE_ADMIN" && userPlaceId) {
          const filteredBikes = bikesResponse.bikes.filter(bike => {
            const bikePlaceId = bike.place?.id || bike.placeId || bike.place_id;
            return bikePlaceId == userPlaceId;
          });
          bikesCount = filteredBikes.length;
        } else {
          bikesCount = bikesResponse.bikes.length;
        }
      }

      if (response.STS === "200" && response.CONTENT) {
        setBookings(response.CONTENT);
        
        // Calculate stats
        const totalBookings = response.CONTENT.length;
        const activeBookings = response.CONTENT.filter(b => b.bookingStatus === "ACTIVE").length;
        const cancelledBookings = response.CONTENT.filter(b => b.bookingStatus === "CANCELLED").length;
        
        // Calculate total payment (exclude cancelled bookings)
        const totalPayment = response.CONTENT
          .filter(booking => booking.bookingStatus !== "CANCELLED")
          .reduce((sum, booking) => {
            const amount = parseFloat(booking.totalAmount || booking.amount || 0);
            return sum + amount;
          }, 0);
        
        setStats({ 
          totalBikes: bikesCount,
          totalBookings, 
          activeBookings, 
          cancelledBookings,
          totalPayment 
        });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatCard
            name="Total Bikes"
            value={stats.totalBikes}
            icon={Bike}
            bgcolor="bg-[#d8ebff]"
            color="text-blue-500"
          />
          <StatCard
            name="Total Bookings"
            value={stats.totalBookings}
            icon={FileText}
            bgcolor="bg-[#e8ffd8]"
            color="text-green-500"
          />
          <StatCard
            name="Active Bookings"
            value={stats.activeBookings}
            icon={CheckCircle}
            bgcolor="bg-[#fff4d8]"
            color="text-yellow-500"
          />
          <StatCard
            name="Cancelled Bookings"
            value={stats.cancelledBookings}
            icon={XCircle}
            bgcolor="bg-[#ffd8d8]"
            color="text-red-500"
          />
          <StatCard
            name="Total Payment"
            value={`₹${stats.totalPayment.toFixed(2)}`}
            icon={DollarSign}
            bgcolor="bg-[#f4d8ff]"
            color="text-purple-500"
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
