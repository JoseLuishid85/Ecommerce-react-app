import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import ApiCartService from '../services/apiCart';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.carrito || [],
        total: calculateTotal(action.payload.carrito || []),
        itemCount: action.payload.carrito?.length || 0,
      };

    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.productId === action.payload.productId);

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          itemCount: updatedItems.length,
          total: calculateTotal(updatedItems),
        };
      } else {
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          itemCount: newItems.length,
          total: calculateTotal(newItems),
        };
      }

    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, cantidad: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.length,
        total: calculateTotal(updatedItems),
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload.id);
      return {
        ...state,
        items: filteredItems,
        itemCount: filteredItems.length,
        total: calculateTotal(filteredItems),
      };

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
};

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (user) {
        try {
          const cartData = await ApiCartService.getCart();
          dispatch({ type: 'SET_CART', payload: cartData });
        } catch (error) {
          console.error('API error:', error);
          const localCart = await AsyncStorage.getItem('cart');
          if (localCart) {
            dispatch({ type: 'SET_CART', payload: JSON.parse(localCart) });
          }
        }
      } else {
        const localCart = await AsyncStorage.getItem('cart');
        if (localCart) {
          dispatch({ type: 'SET_CART', payload: JSON.parse(localCart) });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (product, quantity = 1, variedadId = null) => {
    // Verificar si el usuario está autenticado
    if (!user) {
      return { success: false, requiresAuth: true, message: 'Debes iniciar sesión para agregar productos al carrito' };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const cartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.titulo || product.nombre,
        precio: product.precio,
        cantidad: quantity,
        imagen: product.portada || product.imagen,
        variedadId: variedadId || undefined
      };

      try {
        await ApiCartService.addToCart({
          productoId: product.id,
          variedadId: variedadId,
          clienteId: user.id,
          cantidad: quantity,
          precio: product.precio
        });
        await loadCart();
        return { success: true, message: 'Producto agregado al carrito' };
      } catch (apiError) {
        console.warn('API call failed, using local storage:', apiError);
        const updatedItems = [...state.items, cartItem];
        await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        return { success: true, message: 'Producto agregado al carrito' };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (user) {
        try {
          await ApiCartService.updateCartItem(itemId, { cantidad: quantity });
          await loadCart();
        } catch (apiError) {
          console.warn('API call failed, using local storage:', apiError);
          const updatedItems = state.items.map(item =>
            item.id === itemId ? { ...item, cantidad: quantity } : item
          );
          await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
          dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
        }
      } else {
        const updatedItems = state.items.map(item =>
          item.id === itemId ? { ...item, cantidad: quantity } : item
        );
        await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (user) {
        try {
          await ApiCartService.removeFromCart(itemId);
          await loadCart();
        } catch (apiError) {
          console.warn('API call failed, using local storage:', apiError);
          const updatedItems = state.items.filter(item => item.id !== itemId);
          await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
          dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } });
        }
      } else {
        const updatedItems = state.items.filter(item => item.id !== itemId);
        await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await ApiCartService.deleteCartClient(user.id);
      }
    } catch (error) {
      console.warn('Error clearing cart on API:', error);
    }
    dispatch({ type: 'CLEAR_CART' });
    AsyncStorage.removeItem('cart');
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};