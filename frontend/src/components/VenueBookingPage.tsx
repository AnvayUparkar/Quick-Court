"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { Facility, Court } from "../types"
import { useAuth } from "../contexts/AuthContext"
import { MapPinIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/solid"

const VenueBookingPage = () => {
  // Helper to check if a time slot is in the past for the selected date
  const isTimeSlotPast = (time: string) => {
    if (!selectedDate) return false;
    const now = new Date();
    const selected = new Date(selectedDate);
    if (
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate()
    ) {
      // Parse time string (e.g., "09:00 PM")
      const [raw, period] = time.split(' ');
      let [hours, minutes] = raw.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      const slotDate = new Date(selected);
      slotDate.setHours(hours, minutes, 0, 0);
      return slotDate < now;
    }
    return false;
  }
  const { facilityId, courtId } = useParams<{ facilityId: string; courtId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { facilities } = useData()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [court, setCourt] = useState<Court | null>(null)
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(courtId || null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; isBooked: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const getCourtDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const foundFacility = facilities.find(f => f._id === facilityId)
        if (foundFacility) {
          setFacility(foundFacility)
          // Use selectedCourtId for court selection
          const foundCourt = foundFacility.courts.find(c => c._id === selectedCourtId)
          if (foundCourt) {
            setCourt(foundCourt)
            if (!selectedDate) {
              setSelectedDate(new Date().toISOString().split('T')[0])
            }
          } else {
            setCourt(null)
            setError("Court not found")
          }
        } else {
          setFacility(null)
          setCourt(null)
          setError("Facility not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch court details")
      } finally {
        setLoading(false)
      }
    }

    if (facilityId && facilities.length > 0) {
      getCourtDetails()
    }
  }, [facilityId, selectedCourtId, facilities, selectedDate])

  useEffect(() => {
    if (court && selectedDate) {
      const dateObj = new Date(selectedDate)
      const filteredSlots = court.slots.filter((slot: { date: string; time: string; isBooked: boolean }) => {
        const slotDate = new Date(slot.date)
        return slotDate.toDateString() === dateObj.toDateString()
      })

      // Build a Set of unique times
      const uniqueTimes = Array.from(new Set(filteredSlots.map(s => s.time)))
      // For each unique time, mark as booked if any slot for that time is booked
      const uniqueSlots = uniqueTimes.map(time => {
        const isBooked = filteredSlots.filter(s => s.time === time).some(s => s.isBooked)
        return { time, isBooked }
      })
      uniqueSlots.sort((a, b) => a.time.localeCompare(b.time))
      setAvailableSlots(uniqueSlots)
    }
  }, [court, selectedDate])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setSelectedTimeSlot("") // Reset time slot when date changes
  }

  const handleTimeSlotClick = (time: string, isBooked: boolean) => {
    if (!isBooked) {
      setSelectedTimeSlot(time)
    }
  }

  const handleBookNow = async () => {
    try {
      setBookingLoading(true)
      setError(null)

      if (!user) {
        navigate('/login')
        return
      }

      if (!facility || !court || !selectedDate || !selectedTimeSlot) {
        setError("Please select a date and time slot.")
        return
      }

      // Validate if the selected time slot is still available
      const currentSlot = availableSlots.find(slot => slot.time === selectedTimeSlot)
      if (!currentSlot || currentSlot.isBooked || isTimeSlotPast(selectedTimeSlot)) {
        setError("This time slot is no longer available. Please select another slot.")
        return
      }

      // Store booking data in sessionStorage for payment screen
      const bookingData = {
        sport: court.sportType,
        venue: facility.name,
        date: selectedDate,
        time: selectedTimeSlot,
        duration: 1, // Assuming 1 hour slots
        court: court.name,
        totalPrice: court.pricePerHour,
        venueId: facility._id,
        facilityId: facility._id,
        name: user?.name,
        email: user?.email
      };
      
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
      navigate('/payment');
    } catch (err: any) {
      setError(err.message || "An error occurred while processing your booking.")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="text-center py-10">Loading court booking details...</div>
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>
  if (!facility || !court) return <div className="text-center py-10">Court or facility not found.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book {court ? court.name : "Court"}</h1>
          <p className="text-gray-600 text-lg flex items-center mb-4">
            <MapPinIcon className="h-5 w-5 mr-2" />
            {facility ? `${facility.name} - ${facility.location.address}` : ""}
          </p>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

          {/* Court Selection Dropdown */}
          {facility && facility.courts.length > 1 && (
            <div className="mb-6">
              <label htmlFor="court-select" className="block text-gray-700 font-medium mb-2">Select Court:</label>
              <select
                id="court-select"
                value={selectedCourtId || ""}
                onChange={e => setSelectedCourtId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {facility.courts.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.sportType})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Date Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="h-6 w-6 text-indigo-500" />
                <span>Select Date</span>
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]} // Min date is today
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-indigo-500" />
                <span>Select Time Slot</span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => {
                    const past = isTimeSlotPast(slot.time);
                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSlotClick(slot.time, slot.isBooked || past)}
                        disabled={slot.isBooked || bookingLoading || past}
                        className={`px-4 py-2 rounded-md border text-sm font-medium ${selectedTimeSlot === slot.time
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : slot.isBooked || past
                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {slot.time} {past ? '(Unavailable)' : ''}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-600 col-span-3">No available slots for selected date.</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary and Button */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-2 mb-6">
              <p className="flex justify-between items-center text-gray-700">
                <span>Facility:</span>
                <span className="font-medium">{facility ? facility.name : "N/A"}</span>
              </p>
              <p className="flex justify-between items-center text-gray-700">
                <span>Court:</span>
                <span className="font-medium">{court ? `${court.name} (${court.sportType})` : "N/A"}</span>
              </p>
              <p className="flex justify-between items-center text-gray-700">
                <span>Date:</span>
                <span className="font-medium">{selectedDate || 'N/A'}</span>
              </p>
              <p className="flex justify-between items-center text-gray-700">
                <span>Time Slot:</span>
                <span className="font-medium">{selectedTimeSlot || 'N/A'}</span>
              </p>
              <p className="flex justify-between items-center text-gray-700 text-lg font-bold">
                <span>Total Price:</span>
                <span>₹{court ? court.pricePerHour : "N/A"}</span>
              </p>
            </div>
            <button
              onClick={handleBookNow}
              disabled={!selectedDate || !selectedTimeSlot || bookingLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
            >
              {bookingLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueBookingPage;
