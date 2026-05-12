export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer';
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
  pricePerDay: number;
  description: string;
  location: string;
  images: Array<{
    url: string;
    publicId: string;
  }>;
  totalBookings: number;
  averageRating: number;
}

export interface Booking {
  _id: string;
  car: string | Car;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
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
