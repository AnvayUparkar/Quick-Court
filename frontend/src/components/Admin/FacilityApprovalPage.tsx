import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Facility } from '../../types'; // Assuming you have a Facility type defined
import api from '../../api';
import Loader from '../../components/shared/Loader'; // Import the Loader component

const FacilityApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchAdminStats } = useData();
  const [pendingFacilities, setPendingFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingFacilities = useCallback(async () => {
    try {
      const response = await api.get('/admin/facilities/pending');
      setPendingFacilities(response.data.data);
    } catch (err: any) {
      console.error('Error fetching pending facilities:', err);
      setError(err.message || 'Failed to fetch pending facilities');
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingFacilities().finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError('Access Denied: You are not authorized to view this page.');
    }
  }, [user, fetchPendingFacilities]);

  const handleApproval = useCallback(async (facilityId: string, approved: boolean) => {
    try {
      await api.put(`/admin/facilities/${facilityId}/approve`, {
        approved,
        comment: '', // Add a comment if required
      });

      // Refresh the list of pending facilities and admin stats
      fetchPendingFacilities();
      fetchAdminStats();
    } catch (err: any) {
      console.error('Error updating facility status:', err);
      setError(err.message || 'Failed to update facility status');
    }
  }, [fetchPendingFacilities, fetchAdminStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="w-10 h-10" color="border-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (user?.role !== 'admin') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Facility Approval</h1>

      {pendingFacilities.length === 0 ? (
        <p className="text-center text-gray-600">No facilities pending approval.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingFacilities.map((facility) => (
            <div key={facility._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{facility.name}</h2>
              <p className="text-gray-600 mb-4">Owner: {facility.ownerId?.name || 'N/A'}</p>
              <p className="text-gray-600 mb-4">Email: {facility.ownerId?.email || 'N/A'}</p>
              <p className="text-gray-600 mb-4">Location: {facility.location?.address || 'N/A'}</p>
              <p className="text-gray-600 mb-4">Description: {facility.description}</p>
              {facility.photos && facility.photos.length > 0 && (
                <div className="mb-4">
                  <img src={facility.photos[0]} alt={facility.name} className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleApproval(facility._id, true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(facility._id, false)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilityApprovalPage;
