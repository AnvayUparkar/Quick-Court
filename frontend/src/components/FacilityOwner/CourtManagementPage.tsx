import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFacilityCourts, addCourt, updateCourt, deleteCourt, addTimeSlot, removeTimeSlot } from '../../api';

interface Court {
  _id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHours: { day: string; open: string; close: string }[];
  slots: { _id: string; date: string; time: string; isBooked: boolean }[];
}

interface TimeSlotForm {
  date?: string; // Make optional as we'll use start/end dates
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

const CourtManagementPage = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [currentCourt, setCurrentCourt] = useState<Court | null>(null);
  const [courtFormData, setCourtFormData] = useState({
    name: '',
    sportType: '',
    pricePerHour: '',
    operatingHours: [] as { day: string; open: string; close: string }[],
  });
  const [isEveryday, setIsEveryday] = useState(false);
  const [everydayHours, setEverydayHours] = useState({ open: '09:00', close: '17:00' });
  const [timeSlotFormData, setTimeSlotFormData] = useState<TimeSlotForm>({ startDate: '', endDate: '', startTime: '', endTime: '' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (facilityId) {
      console.log('Component mounted: Attempting to fetch courts for facilityId:', facilityId);
      fetchCourts(facilityId);
    } else {
      console.error('No facilityId found in URL params');
      setError('No facility ID provided');
      setLoading(false);
    }
  }, [facilityId]);

  const fetchCourts = async (id: string) => {
    console.log('fetchCourts: Starting fetch for facilityId:', id);
    try {
      setLoading(true);
      setError(null);
      const response = await getFacilityCourts(id);
      console.log('fetchCourts: Full API Response:', response);
      console.log('fetchCourts: Response data:', response.data);
      
      if (response.data && response.data.success) {
        setCourts(response.data.data);
        console.log('fetchCourts: Courts successfully set to state:', response.data.data);
      } else {
        console.error('fetchCourts: Unexpected response structure:', response);
        setError('Unexpected response format from server');
      }
    } catch (err: any) {
      console.error('fetchCourts: Error occurred:', err);
      console.error('fetchCourts: Error response:', err.response);
      console.error('fetchCourts: Error message:', err.message);
      
      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Network error: Unable to reach server');
      } else {
        setError('Failed to fetch courts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourtFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCourtFormData({ ...courtFormData, [e.target.name]: e.target.value });
  };

  const handleOperatingHoursChange = (index: number, field: string, value: string) => {
    const updatedHours = [...courtFormData.operatingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setCourtFormData({ ...courtFormData, operatingHours: updatedHours });
  };

  const addOperatingHour = () => {
    setCourtFormData({
      ...courtFormData,
      operatingHours: [...courtFormData.operatingHours, { day: 'Monday', open: '09:00', close: '17:00' }],
    });
  };

  const removeOperatingHour = (index: number) => {
    const updatedHours = courtFormData.operatingHours.filter((_, i) => i !== index);
    setCourtFormData({ ...courtFormData, operatingHours: updatedHours });
  };

  const handleAddCourt = () => {
    setCurrentCourt(null);
    setCourtFormData({
      name: '',
      sportType: '',
      pricePerHour: '',
      operatingHours: [],
    });
    setIsEveryday(false);
    setEverydayHours({ open: '09:00', close: '17:00' });
    setIsCourtModalOpen(true);
  };

  const handleEditCourt = (court: Court) => {
    setCurrentCourt(court);
    // Determine if operating hours are 'everyday'
    const allDaysMatch = daysOfWeek.every(day => 
        court.operatingHours.some(oh => oh.day === day && 
                                      oh.open === court.operatingHours[0]?.open && 
                                      oh.close === court.operatingHours[0]?.close)
    ) && court.operatingHours.length === daysOfWeek.length;

    setIsEveryday(allDaysMatch);
    if (allDaysMatch && court.operatingHours.length > 0) {
      setEverydayHours({ open: court.operatingHours[0].open, close: court.operatingHours[0].close });
    } else {
      setEverydayHours({ open: '09:00', close: '17:00' });
    }
    setCourtFormData({
      name: court.name,
      sportType: court.sportType,
      pricePerHour: court.pricePerHour.toString(),
      operatingHours: allDaysMatch ? [] : court.operatingHours, // Clear if everyday, otherwise keep existing
    });
    setIsCourtModalOpen(true);
  };

  const handleCourtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!facilityId) {
      setError('No facility ID available');
      return;
    }

    let operatingHoursToSubmit = [];
    if (isEveryday) {
      operatingHoursToSubmit = daysOfWeek.map(day => ({
        day,
        open: everydayHours.open,
        close: everydayHours.close,
      }));
    } else {
      operatingHoursToSubmit = courtFormData.operatingHours;
    }

    const data = {
      facilityId,
      name: courtFormData.name,
      sportType: courtFormData.sportType,
      pricePerHour: parseFloat(courtFormData.pricePerHour),
      operatingHours: operatingHoursToSubmit,
    };

    console.log('handleCourtSubmit: Submitting court data:', data);

    try {
      if (currentCourt) {
        console.log('handleCourtSubmit: Updating existing court:', currentCourt._id);
        await updateCourt(facilityId, currentCourt._id, data);
      } else {
        console.log('handleCourtSubmit: Adding new court');
        await addCourt(facilityId, data);
      }
      await fetchCourts(facilityId);
      setIsCourtModalOpen(false);
    } catch (err: any) {
      console.error('handleCourtSubmit: Error saving court:', err);
      setError(err.response?.data?.message || 'Failed to save court.');
    }
  };

  const handleDeleteCourt = async (courtId: string) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        if (!facilityId) return;
        console.log('handleDeleteCourt: Deleting court:', courtId);
        await deleteCourt(facilityId, courtId);
        await fetchCourts(facilityId);
      } catch (err: any) {
        console.error('handleDeleteCourt: Error deleting court:', err);
        setError('Failed to delete court.');
      }
    }
  };

  const handleTimeSlotFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeSlotFormData({ ...timeSlotFormData, [e.target.name]: e.target.value });
  };

  const handleAddTimeSlot = (court: Court) => {
    console.log('handleAddTimeSlot: Opening time slot modal for court:', court);
    setCurrentCourt(court);
    // Initialize start and end dates to today for convenience
    const today = new Date().toISOString().split('T')[0];
    setTimeSlotFormData({ startDate: today, endDate: today, startTime: '', endTime: '' });
    setIsSlotModalOpen(true);
  };

  const handleTimeSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!facilityId || !currentCourt?._id) {
      setError('Missing facility or court information');
      return;
    }

    const { startDate, endDate, startTime, endTime } = timeSlotFormData;

    if (!startDate || !endDate || !startTime || !endTime) {
      setError('Please select a start date, end date, and time range.');
      return;
    }

    console.log('handleTimeSlotSubmit: Adding time slot:', { startDate, endDate, startTime, endTime });

    try {
      await addTimeSlot(facilityId, currentCourt._id, { startDate, endDate, startTime, endTime });
      await fetchCourts(facilityId);
      setIsSlotModalOpen(false);
    } catch (err: any) {
      console.error('handleTimeSlotSubmit: Error adding time slot:', err);
      setError(err.response?.data?.message || 'Failed to add time slot.');
    }
  };

  const handleRemoveTimeSlot = async (courtId: string, slotId: string) => {
    if (window.confirm('Are you sure you want to remove this time slot?')) {
      try {
        if (!facilityId) return;
        console.log('handleRemoveTimeSlot: Removing slot:', slotId, 'from court:', courtId);
        await removeTimeSlot(facilityId, courtId, slotId);
        await fetchCourts(facilityId);
      } catch (err: any) {
        console.error('handleRemoveTimeSlot: Error removing time slot:', err);
        setError('Failed to remove time slot.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading courts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
          <button 
            onClick={() => facilityId && fetchCourts(facilityId)}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Courts</h1>
        <p className="text-gray-600">Facility ID: {facilityId}</p>
      </div>
      
      <button
        onClick={handleAddCourt}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg mb-6 hover:bg-blue-600 transition-colors font-medium"
      >
        Add New Court
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.length > 0 ? (
          courts.map((court) => (
            <div key={court._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{court.name}</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Sport:</span>
                    <span className="ml-2">{court.sportType}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Price:</span>
                    <span className="ml-2">${court.pricePerHour}/hour</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Operating Hours:</h3>
                  {isEveryday ? (
                    <p className="text-xs text-gray-600">Everyday: {everydayHours.open} - {everydayHours.close}</p>
                  ) : (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {court.operatingHours.map((oh, idx) => (
                        <li key={idx}>{oh.day}: {oh.open} - {oh.close}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Available Slots:</h3>
                  {court.slots.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {(() => {
                          // Deduplicate by date+time
                          const slotMap = new Map<string, { date: string; time: string; isBooked: boolean; ids: string[] }>();
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          court.slots.forEach(slot => {
                            const slotDate = new Date(slot.date);
                            slotDate.setHours(0,0,0,0);
                            if (slotDate >= today) {
                              const key = `${slot.date}|${slot.time}`;
                              if (!slotMap.has(key)) {
                                slotMap.set(key, { date: slot.date, time: slot.time, isBooked: slot.isBooked, ids: [slot._id] });
                              } else {
                                const entry = slotMap.get(key)!;
                                entry.isBooked = entry.isBooked || slot.isBooked;
                                entry.ids.push(slot._id);
                              }
                            }
                          });
                          return Array.from(slotMap.values()).sort((a, b) => {
                            // Sort by date then time
                            const dateA = new Date(a.date).getTime();
                            const dateB = new Date(b.date).getTime();
                            if (dateA !== dateB) return dateA - dateB;
                            return a.time.localeCompare(b.time);
                          }).map((slot) => (
                            <li key={slot.date + slot.time} className="flex justify-between items-center">
                              <span>
                                {new Date(slot.date).toLocaleDateString()} at {slot.time}
                                <span className={`ml-1 ${slot.isBooked ? 'text-red-500' : 'text-green-500'}`}>
                                  ({slot.isBooked ? 'Booked' : 'Available'})
                                </span>
                              </span>
                              {!slot.isBooked && (
                                <button
                                  onClick={() => handleRemoveTimeSlot(court._id, slot.ids[0])}
                                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No time slots added</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditCourt(court)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourt(court._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleAddTimeSlot(court)}
                    className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition-colors"
                  >
                    Add Slot
                  </button>
                  <button
                    onClick={() => window.location.href = `/owner/facilities/${facilityId}/bookings`}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Manage Bookings
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m5 0h4" />
                </svg>
                <p className="text-lg font-medium">No courts found</p>
                <p className="text-sm">Add your first court to get started!</p>
              </div>
              <button
                onClick={handleAddCourt}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Your First Court
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Court Modal */}
      {isCourtModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{currentCourt ? 'Edit Court' : 'Add New Court'}</h2>
            <form onSubmit={handleCourtSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Court Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={courtFormData.name}
                  onChange={handleCourtFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="sportType" className="block text-sm font-medium text-gray-700">Sport Type</label>
                <input
                  type="text"
                  id="sportType"
                  name="sportType"
                  value={courtFormData.sportType}
                  onChange={handleCourtFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">Price Per Hour ($)</label>
                <input
                  type="number"
                  id="pricePerHour"
                  name="pricePerHour"
                  value={courtFormData.pricePerHour}
                  onChange={handleCourtFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isEveryday}
                    onChange={(e) => setIsEveryday(e.target.checked)}
                  />
                  Set same operating hours for everyday
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Operating Hours</h3>
                {isEveryday ? (
                  <div className="flex space-x-2 mb-2 items-center">
                    <input
                      type="time"
                      value={everydayHours.open}
                      onChange={(e) => setEverydayHours({ ...everydayHours, open: e.target.value })}
                      className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="time"
                      value={everydayHours.close}
                      onChange={(e) => setEverydayHours({ ...everydayHours, close: e.target.value })}
                      className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    {courtFormData.operatingHours.map((hour, index) => (
                      <div key={index} className="flex space-x-2 mb-2 items-center">
                        <select
                          value={hour.day}
                          onChange={(e) => handleOperatingHoursChange(index, 'day', e.target.value)}
                          className="mt-1 block w-1/3 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <input
                          type="time"
                          value={hour.open}
                          onChange={(e) => handleOperatingHoursChange(index, 'open', e.target.value)}
                          className="mt-1 block w-1/3 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={hour.close}
                          onChange={(e) => handleOperatingHoursChange(index, 'close', e.target.value)}
                          className="mt-1 block w-1/3 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeOperatingHour(index)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOperatingHour}
                      className="mt-2 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Add Operating Hour
                    </button>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCourtModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {currentCourt ? 'Update Court' : 'Create Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {isSlotModalOpen && currentCourt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Add Time Slot for {currentCourt.name}</h2>
            <form onSubmit={handleTimeSlotSubmit} className="space-y-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={timeSlotFormData.startTime}
                  onChange={handleTimeSlotFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={timeSlotFormData.endTime}
                  onChange={handleTimeSlotFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={timeSlotFormData.startDate}
                  onChange={handleTimeSlotFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={timeSlotFormData.endDate}
                  onChange={handleTimeSlotFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  min={timeSlotFormData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManagementPage;