import api from './api';

const DB_NAME = 'ModernSelfdriveOffline';
const DB_VERSION = 1;

class OfflineSyncService {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = new Set();
    
    window.addEventListener('online', () => this.handleOnlineStatusChange(true));
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('cars')) {
          db.createObjectStore('cars', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          db.createObjectStore('bookings', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  handleOnlineStatusChange(online) {
    this.isOnline = online;
    this.notifyListeners({ type: 'connection', online });
    if (online) {
      this.syncPendingChanges();
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  getOnlineStatus() {
    return this.isOnline;
  }

  // Generic CRUD operations
  async saveToLocal(storeName, data) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async getFromLocal(storeName, key) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFromLocal(storeName) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromLocal(storeName, key) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue changes for sync
  async queueChange(operation, storeName, data) {
    const change = {
      operation,
      storeName,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.add(change);
      request.onsuccess = () => resolve(change);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync pending changes when online
  async syncPendingChanges() {
    if (!this.isOnline || this.syncInProgress) return;
    
    this.syncInProgress = true;
    this.notifyListeners({ type: 'sync', status: 'started' });

    try {
      const pendingChanges = await this.getAllFromLocal('syncQueue');
      
      for (const change of pendingChanges) {
        try {
          await this.processChange(change);
          await this.deleteFromLocal('syncQueue', change.id);
        } catch (err) {
          console.error('Failed to sync change:', err);
        }
      }
      
      this.notifyListeners({ type: 'sync', status: 'completed' });
    } catch (err) {
      console.error('Sync failed:', err);
      this.notifyListeners({ type: 'sync', status: 'error', error: err.message });
    } finally {
      this.syncInProgress = false;
    }
  }

  async processChange(change) {
    const { operation, storeName, data } = change;
    const endpoint = `/${storeName}`;
    
    switch (operation) {
      case 'create':
        await api.post(endpoint, data);
        break;
      case 'update':
        await api.put(`${endpoint}/${data._id}`, data);
        break;
      case 'delete':
        await api.delete(`${endpoint}/${data._id}`);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // Fetch and cache data
  async fetchAndCache(endpoint, storeName, params = {}) {
    if (this.isOnline) {
      try {
        const response = await api.get(endpoint, { params });
        const data = Array.isArray(response.data) ? response.data : [response.data];
        
        for (const item of data) {
          await this.saveToLocal(storeName, item);
        }
        
        this.notifyListeners({ type: 'fetch', storeName, data });
        return response.data;
      } catch (err) {
        console.error('Online fetch failed, using cache:', err);
      }
    }
    
    return this.getAllFromLocal(storeName);
  }

  // Sync cars
  async syncCars(forceOnline = false) {
    const endpoint = '/api/admin/cars';
    
    if (this.isOnline || forceOnline) {
      try {
        const response = await api.get(endpoint);
        const cars = response.data;
        
        for (const car of cars) {
          await this.saveToLocal('cars', car);
        }
        
        this.notifyListeners({ type: 'sync', storeName: 'cars', data: cars });
        return cars;
      } catch (err) {
        console.error('Car sync failed:', err);
      }
    }
    
    return this.getAllFromLocal('cars');
  }

  // Sync bookings
  async syncBookings(forceOnline = false) {
    const endpoint = '/api/admin/bookings';
    
    if (this.isOnline || forceOnline) {
      try {
        const response = await api.get(endpoint);
        const bookings = response.data;
        
        for (const booking of bookings) {
          await this.saveToLocal('bookings', booking);
        }
        
        this.notifyListeners({ type: 'sync', storeName: 'bookings', data: bookings });
        return bookings;
      } catch (err) {
        console.error('Booking sync failed:', err);
      }
    }
    
    return this.getAllFromLocal('bookings');
  }

  // Sync users
  async syncUsers(forceOnline = false) {
    const endpoint = '/api/admin/users';
    
    if (this.isOnline || forceOnline) {
      try {
        const response = await api.get(endpoint);
        const users = response.data;
        
        for (const user of users) {
          await this.saveToLocal('users', user);
        }
        
        this.notifyListeners({ type: 'sync', storeName: 'users', data: users });
        return users;
      } catch (err) {
        console.error('User sync failed:', err);
      }
    }
    
    return this.getAllFromLocal('users');
  }

  // Quick offline booking creation
  async createOfflineBooking(bookingData) {
    const tempId = 'offline_' + Date.now();
    const offlineBooking = {
      _id: tempId,
      ...bookingData,
      status: 'Pending',
      synced: false,
      createdAt: new Date().toISOString()
    };
    
    await this.saveToLocal('bookings', offlineBooking);
    await this.queueChange('create', 'bookings', offlineBooking);
    
    if (this.isOnline) {
      this.syncPendingChanges();
    }
    
    this.notifyListeners({ type: 'offlineCreate', storeName: 'bookings', data: offlineBooking });
    return offlineBooking;
  }

  // Settings
  async saveSetting(key, value) {
    const setting = { key, value, updatedAt: new Date().toISOString() };
    await this.saveToLocal('settings', setting);
    return setting;
  }

  async getSetting(key) {
    const setting = await this.getFromLocal('settings', key);
    return setting?.value;
  }
}

export const offlineSync = new OfflineSyncService();
export default offlineSync;