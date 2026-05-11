export const SOCKET_EVENTS = Object.freeze({
  // Booking lifecycle
  BOOKING_CREATED:        'booking:created',
  BOOKING_STATUS_UPDATED: 'booking:status_updated',
  BOOKING_CANCELLED:      'booking:cancelled',

  // Car management
  CAR_CREATED:            'car:created',
  CAR_UPDATED:            'car:updated',
  CAR_DELETED:            'car:deleted',
  CAR_AVAILABILITY_CHANGED: 'car:availability_changed',

  // System
  CONNECTION_ERROR:       'connection:error',
});
