import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiService {
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

    // Agregar token de autenticación si existe
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Productos
  async getProducts(params = {}) {
    return this.request('/publico/obtener_productos_shop');
  }

  async getProduct(slug) {
    return this.request(`/publico/obtener_producto_slug/${slug}`);
  }

  // Categorías
  async getCategories() {
    return this.request('/publico/lista_categorias');
  }

  // Pedidos
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  // Autenticación
  async loginClient(credentials) {
    return this.request('/login/tienda', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerClient(userData) {
    return this.request('/cliente', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Helper para obtener URL de imagen
  getProductImageUrl(portada) {
    if (!portada) return null;
    const filename = portada.split('/').pop();
    return `${this.baseURL}/producto/obtener_image_producto/${filename}`;
  }
}

export default new ApiService();
