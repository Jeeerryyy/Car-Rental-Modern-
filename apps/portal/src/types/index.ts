export interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  role: 'owner';
  profileImage?: {
    url: string;
    publicId: string;
  };
}

export interface Car {
  _id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  category: string;
  fuelType?: string;
  transmission?: string;
  registrationNumber?: string;
  pricePerDay: number;
  isActive: boolean;
  isDeleted: boolean;
  totalBookings: number;
  averageRating: number;
}

export interface Booking {
  _id: string;
  car: string | Car;
  customer: any;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardMetrics {
  revenue: {
    monthly: number;
    total: number;
    trend: number;
  };
  bookings: {
    active: number;
    total: number;
    trend: number;
  };
  fleet: {
    totalCars: number;
    totalBikes: number;
    activeCars: number;
    activeBikes: number;
    utilizationRate: number;
  };
  recentBookings: Booking[];
  recentReviews: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}
