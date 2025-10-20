import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOwnerFacilities, createFacility, updateFacility, deleteFacility } from '../../api';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

interface Location { 
  address: string;
  coordinates: number[];
}

interface Facility {
  _id: string;
  name: string;
  description: string;
  location: Location;
  sports: string[];
  amenities: string[];
  photos: string[];
  primaryPhoto?: string; // Add this line
  approved: boolean;
  owner?: string; // Add owner field
}

const FacilityManagementPage = () => {
  const { user } = useAuth();
  const { fetchAdminStats, fetchOwnerBookings } = useData();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Add success message state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    coordinates: '',
    sports: '',
    amenities: '',
    photos: [] as File[],
    currentPhotoUrls: [] as string[],
    primaryPhotoUrl: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log('FacilityManagementPage useEffect triggered');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('User ID:', user?._id);
    console.log('Local storage token:', localStorage.getItem('token'));
    
    if (user?._id && user?.role === 'facility_owner') {
      console.log('User ID found and role is facility_owner, fetching facilities...');
      fetchFacilities(user._id);
    } else {
      console.log('No user ID found or user is not a facility owner');
      if (!user?._id) {
        console.log('No user ID');
      }
      if (user?.role !== 'facility_owner') {
        console.log('User role is not facility_owner:', user?.role);
      }
    }
  }, [user]);

  const fetchFacilities = async (ownerId: string) => {
    console.log('Fetching facilities for ownerId:', ownerId);
    try {
      setLoading(true);
      setError(null);
      const response = await getOwnerFacilities(ownerId);
      console.log('API Response:', response);
      setFacilities(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch facilities.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, photos: Array.from(e.target.files) });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      coordinates: '',
      sports: '',
      amenities: '',
      photos: [],
      currentPhotoUrls: [],
      primaryPhotoUrl: '',
    });
    setCurrentFacility(null);
  };

  const handleAddFacility = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditFacility = (facility: Facility) => {
    console.log('Editing facility:', facility);
    setCurrentFacility(facility);
    setFormData({
      name: facility.name,
      description: facility.description,
      address: facility.location.address,
      coordinates: JSON.stringify(facility.location.coordinates),
      sports: Array.isArray(facility.sports) ? facility.sports.join(', ') : '',
      amenities: Array.isArray(facility.amenities) ? facility.amenities.join(', ') : '',
      photos: [],
      currentPhotoUrls: Array.isArray(facility.photos) ? facility.photos : [],
      primaryPhotoUrl: facility.primaryPhoto || '',
    });
    setIsModalOpen(true);
  };

  const validateCoordinates = (coordString: string): boolean => {
    try {
      const coords = JSON.parse(coordString);
      return Array.isArray(coords) && coords.length === 2 && 
             typeof coords[0] === 'number' && typeof coords[1] === 'number';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate coordinates
      if (!validateCoordinates(formData.coordinates)) {
        throw new Error('Invalid coordinates format. Please use [longitude, latitude] format.');
      }

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      
      // Handle location data
      const locationData = {
        address: formData.address.trim(),
        coordinates: JSON.parse(formData.coordinates),
      };
      data.append('location', JSON.stringify(locationData));
      
      // Handle sports and amenities arrays
      const sportsArray = formData.sports.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
      
      data.append('sports', JSON.stringify(sportsArray));
      data.append('amenities', JSON.stringify(amenitiesArray));
      
      // Handle photos
      if (currentFacility) {
        data.append('currentPhotoUrls', JSON.stringify(formData.currentPhotoUrls));
      }
      
      formData.photos.forEach((photo, _) => {
        data.append('photos', photo);
      });

      // Add primary photo URL if selected
      if (formData.primaryPhotoUrl) {
        data.append('primaryPhoto', formData.primaryPhotoUrl);
      }

      console.log('Submitting form data for:', currentFacility ? 'update' : 'create');
      console.log('Current facility ID:', currentFacility?._id);

      if (currentFacility) {
        console.log('Updating facility with ID:', currentFacility._id);
        const response = await updateFacility(currentFacility._id, data);
        console.log('Update response:', response);
      } else {
        console.log('Creating new facility');
        const response = await createFacility(data);
        console.log('Create response:', response);
      }

      // Refresh facilities list
      if (user?._id) {
        await fetchFacilities(user._id);
      }
      // Refresh stats after facility change
      if (user?.role === 'admin') {
        await fetchAdminStats();
      }
      if (user?.role === 'facility_owner') {
        await fetchOwnerBookings();
      }
      
      setIsModalOpen(false);
      resetForm();
      setSuccessMessage(`Facility ${currentFacility ? 'updated' : 'created'} successfully!`); // Set success message
    } catch (err: any) {
      console.error('Error submitting form:', err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate('/login'); // Manually redirect after showing message
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to save facility.';
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (facility: Facility) => {
    console.log('Attempting to delete facility:', facility._id, facility.name);
    
    if (window.confirm(`Are you sure you want to delete "${facility.name}" and all its associated courts? This action cannot be undone.`)) {
      try {
        setError(null);
        console.log('Deleting facility with ID:', facility._id);
        const response = await deleteFacility(facility._id);
        console.log('Delete response:', response);
        
        // Refresh facilities list
        if (user?._id) {
          await fetchFacilities(user._id);
        }
        // Refresh stats after facility delete
        if (user?.role === 'admin') {
          await fetchAdminStats();
        }
        if (user?.role === 'facility_owner') {
          await fetchOwnerBookings();
        }
      } catch (err: any) {
        console.error('Error deleting facility:', err);
        const errorMessage = err.response?.data?.message || 'Failed to delete facility.';
        setError(errorMessage);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError(null);
    setSuccessMessage(null); // Clear success message on modal close
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading facilities...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500 text-center">Please log in to access this page.</div>
        </div>
      </div>
    );
  }

  if (user.role !== 'facility_owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500 text-center">Access denied. Only facility owners can view this page.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Your Facilities</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <button
          onClick={handleAddFacility}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 transition duration-200"
        >
          Add New Facility
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.length > 0 ? (
            facilities.map((facility) => (
              <div key={facility._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:border-2 hover:border-indigo-500 transition duration-200">
                <img
                  src={facility.primaryPhoto 
                       ? `${facility.primaryPhoto}?v=${new Date().getTime()}`
                       : facility.photos && facility.photos.length > 0 
                         ? `${facility.photos[0]}?v=${new Date().getTime()}` 
                         : 'https://via.placeholder.com/400'}
                  alt={facility.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-2">
                    {!facility.approved && (
                      <span className="text-yellow-500 mr-2 text-sm">(Pending Approval)</span>
                    )}
                    {facility.name}
                  </h2>
                  <p className="text-gray-600 mb-2 line-clamp-2">{facility.description}</p>
                  <p className="text-gray-700 text-sm mb-1">
                    <strong>Address:</strong> {facility.location?.address || 'N/A'}
                  </p>
                  <p className="text-gray-700 text-sm mb-1">
                    <strong>Sports:</strong> {Array.isArray(facility.sports) ? facility.sports.join(', ') : 'N/A'}
                  </p>
                  <p className="text-gray-700 text-sm mb-4">
                    <strong>Amenities:</strong> {Array.isArray(facility.amenities) ? facility.amenities.join(', ') : 'N/A'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <button
                      onClick={() => handleEditFacility(facility)}
                      className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 text-sm"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(facility)}
                      className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => navigate(`/owner/facilities/${facility._id}/courts`)}
                      className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 text-sm"
                    >
                      <span>Manage Courts</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No facilities found.</p>
              <p className="text-gray-500">Add a new facility to get started!</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {currentFacility ? 'Edit Facility' : 'Add New Facility'}
              </h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700">
                    Coordinates (JSON Array: [longitude, latitude]) *
                  </label>
                  <input
                    type="text"
                    id="coordinates"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    placeholder="e.g., [-74.0060, 40.7128]"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="sports" className="block text-sm font-medium text-gray-700">
                    Sports (comma-separated) *
                  </label>
                  <input
                    type="text"
                    id="sports"
                    name="sports"
                    value={formData.sports}
                    onChange={handleChange}
                    placeholder="e.g., Tennis, Basketball, Football"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="amenities"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="e.g., Parking, Restrooms, Changing Rooms"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="photos" className="block text-sm font-medium text-gray-700">
                    Photos (max 10 files)
                  </label>
                  <input
                    type="file"
                    id="photos"
                    name="photos"
                    multiple
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    disabled={isSubmitting}
                  />
                  {formData.currentPhotoUrls.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Current Photos:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.currentPhotoUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={url} 
                              alt={`Facility ${index + 1}`}
                              className={`w-16 h-16 object-cover rounded border cursor-pointer ${formData.primaryPhotoUrl === url ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                              onClick={() => setFormData({ ...formData, primaryPhotoUrl: url })}
                            />
                            {formData.primaryPhotoUrl === url && (
                              <span className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1 text-xs">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (currentFacility ? 'Update Facility' : 'Create Facility')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityManagementPage;