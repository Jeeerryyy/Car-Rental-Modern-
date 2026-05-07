import api from './api';

const SYNC_QUEUE_KEY = 'owner_sync_queue';

const getQueue = () => JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
const saveQueue = (queue) => localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

const syncManager = {
  // Add an operation to the queue
  async performMutation(method, url, data) {
    if (!navigator.onLine) {
      const queue = getQueue();
      queue.push({ method, url, data, id: Date.now() });
      saveQueue(queue);
      return { success: true, queued: true };
    }

    try {
      const response = await api[method.toLowerCase()](url, data);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  async processQueue() {
    if (!navigator.onLine) return;
    
    const queue = getQueue();
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      try {
        await api[item.method.toLowerCase()](item.url, item.data);
      } catch (err) {
        remaining.push(item);
      }
    }
    
    saveQueue(remaining);
  }
};

window.addEventListener('online', () => {
  syncManager.processQueue();
});

export default syncManager;
