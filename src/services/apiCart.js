import axios from 'axios';

const API_BASE_URL = 'https://tu-api.com/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar el token de autenticación si es necesario
    // const token = await AsyncStorage.getItem('clientToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const ApiCartService = {
  // Obtener carrito
  getCart: async () => {
    try {
      // Simular respuesta de API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            carrito: [],
            total: 0,
            itemCount: 0
          });
        }, 500);
      });
      
      // Para uso real con API:
      // const response = await api.get('/carrito');
      // return response.data;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw new Error('Error al obtener el carrito');
    }
  },

  // Agregar al carrito
  addToCart: async (cartItem) => {
    try {
      // Simular respuesta de API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Producto agregado al carrito'
          });
        }, 500);
      });
      
      // Para uso real con API:
      // const response = await api.post('/carrito/agregar', cartItem);
      // return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Error al agregar producto al carrito');
    }
  },

  // Actualizar item del carrito
  updateCartItem: async (itemId, updates) => {
    try {
      // Simular respuesta de API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Carrito actualizado'
          });
        }, 500);
      });
      
      // Para uso real con API:
      // const response = await api.put(`/carrito/actualizar/${itemId}`, updates);
      // return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Error al actualizar producto en el carrito');
    }
  },

  // Eliminar del carrito
  removeFromCart: async (itemId) => {
    try {
      // Simular respuesta de API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Producto eliminado del carrito'
          });
        }, 500);
      });
      
      // Para uso real con API:
      // const response = await api.delete(`/carrito/eliminar/${itemId}`);
      // return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Error al eliminar producto del carrito');
    }
  },

  // Limpiar carrito
  clearCart: async () => {
    try {
      // Simular respuesta de API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Carrito limpiado'
          });
        }, 500);
      });
      
      // Para uso real con API:
      // const response = await api.delete('/carrito/limpiar');
      // return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Error al limpiar el carrito');
    }
  },
};

export default ApiCartService;