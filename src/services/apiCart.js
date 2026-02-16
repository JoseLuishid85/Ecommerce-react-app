import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiCartService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = await AsyncStorage.getItem('clientToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Cart request failed:', error);
      throw error;
    }
  }

  async getCart() {
    return this.request('/customer/cliente');
  }

  async addToCart(product) {
    return this.request('/customer', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateCartItem(itemId, data) {
    return this.request(`/customer/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/customer/${itemId}`, {
      method: 'DELETE',
    });
  }

  async deleteCartClient(userId) {
    return this.request(`/customer/cliente/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const ApiCartServiceInstance = new ApiCartService();
export default ApiCartServiceInstance;
