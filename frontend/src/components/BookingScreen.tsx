"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline"
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid"

const BookingScreen = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("09:00 PM")
  const [duration, setDuration] = useState(2)
  const [selectedCourt, setSelectedCourt] = useState("")

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      // Store the intended destination
      sessionStorage.setItem("intendedDestination", `/booking/${id}`)
      navigate("/login")
    }
  }, [user, navigate, id])

  const venue = {
    name: "SBR Badminton",
    location: "Satellite, Jodhpur Village",
    sport: "Badminton",
    rating: 4.5,
    reviews: 6,
  }

  const courts = ["Court 1", "Court 2"]
  const timeSlots = ["09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM"]

  const pricePerHour = 1200
  const totalPrice = pricePerHour * duration

  const handleConfirmBooking = () => {
    console.log('handleConfirmBooking called');
    // Save booking data to session storage for payment screen
    const bookingData = {
      venue: venue.name,
      sport: venue.sport,
      court: selectedCourt,
      date: selectedDate.toLocaleDateString(),
      time: selectedTime,
      duration: duration,
      totalPrice: totalPrice,
      facilityId: id,
      name: user?.name,
      email: user?.email
    }
    console.log('Saving booking data:', bookingData);
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Redirect to payment screen
    console.log('Redirecting to payment screen');
    try {
      console.log('Starting navigation...');
      navigate('/payment');
      console.log('Navigation completed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  // Calendar functionality
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const handleContinue = () => {
    if (!user) {
      sessionStorage.setItem("intendedDestination", `/booking/${id}`)
      navigate("/login")
      return
    }
    setShowConfirm(true)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const days = getDaysInMonth(currentMonth)

  // Don't render if not authenticated (will redirect)
    if (!user) {
      return null
    }
  return (
    <div className="min-h-screen bg-gray-50">
      {showConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={(e) => {
            // Prevent clicks on the overlay from closing the modal
            e.stopPropagation();
            console.log('Modal overlay clicked');
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Confirm Booking</h2>
            <p className="mb-6">Do you want to proceed to payment and confirm your booking?</p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700"
                onClick={() => {
                  console.log('Confirm button clicked');
                  handleConfirmBooking();
                }}
              >
                Yes, Proceed to Payment
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400"
                onClick={() => {
                  console.log('Cancel button clicked');
                  setShowConfirm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/courts")}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold">QUICKCOURT</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-6 w-6 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Court Booking</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            {/* Venue Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h2>
              <div className="flex items-center space-x-1 text-gray-600">
                <MapPinIcon className="h-4 w-4" />
                <span>{venue.location}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 mt-1">
                <span className="text-yellow-400">★</span>
                <span>
                  {venue.rating} ({venue.reviews})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🏸</span>
                    <span className="font-medium text-gray-900">{venue.sport}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="text"
                    value={formatDate(selectedDate)}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition duration-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-lg min-w-[60px] text-center">{duration}hr</span>
                    <button
                      onClick={() => setDuration(duration + 1)}
                      className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition duration-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Court</label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">--Select Court--</option>
                    {courts.map((court) => (
                      <option key={court} value={court}>
                        {court}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedCourt}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment - ₹{totalPrice.toLocaleString()}.00
                </button>
              </div>

              {/* Right Column - Calendar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={!date || date < new Date()}
                        className={`p-2 text-sm rounded-lg transition duration-200 aspect-square flex items-center justify-center ${
                          !date
                            ? "invisible"
                            : date < new Date()
                              ? "text-gray-300 cursor-not-allowed"
                              : date.toDateString() === selectedDate.toDateString()
                                ? "bg-emerald-600 text-white"
                                : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {date?.getDate()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">{duration} hour(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Court:</span>
                      <span className="text-gray-900">{selectedCourt || "Not selected"}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{totalPrice.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingScreen
