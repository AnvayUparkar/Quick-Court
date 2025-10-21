export interface OwnerStats {
  totalBookings: number;
  activeCourts: number;
  totalEarnings: number;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'facility_owner' | 'admin';
  avatar?: string;
  verified: boolean;
  isBanned?: boolean;
  // Add other user-related fields as necessary
}

export interface Facility {
  _id: string;
  name: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  sports: string[];
  amenities: string[];
  photos: string[]; // Cloudinary URLs
  primaryPhoto?: string; // Add this line
  ownerId: User; // Populated User object or just ID
  approved: boolean;
  courts: Court[]; // Populated Court objects or just IDs
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  _id: string;
  facilityId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHours: { start: string; end: string };
  slots: Array<{ date: string; time: string; isBooked: boolean; bookedBy?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  userId: User;
  facilityId: Facility;
  courtId: Court;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalFacilityOwners: number;
  totalBookings: number;
  totalActiveCourts: number;
  approvedFacilities: number;
  pendingFacilities: number;
  // Add more fields as needed for charts
}

export interface Review {
  _id: string;
  userId: User; // Changed from string to User
  facilityId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
