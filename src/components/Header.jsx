import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = ({ navigation }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();

  const getHeaderTitle = () => {
    const routeName = route.name;

    const titles = {
      Home: 'Inicio',
      Products: 'Productos',
      ProductDetail: 'Detalle',
      Checkout: 'Carrito',
      Login: 'Iniciar Sesión',
      Categories: 'Categorías',
      Offers: 'Ofertas',
      Contact: 'Contacto',
      Orders: 'Mis Pedidos',
      Profile: 'Mi Perfil',
    };

    return titles[routeName] || routeName;
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleUserPress = () => {
    if (isAuthenticated) {
      // Si está autenticado, podría ir a perfil o mostrar menú
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Login');
    }
  };

  const showBackButton = route.name !== 'Home';

  return (
    <View style={[styles.headerContainer, { height: 60 + insets.top, paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        {/* Lado izquierdo: Logo/Botón Retroceso */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.logoText}>Tienda</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Centro: Título de la pantalla */}
        <View style={styles.centerSection}>
          <Text style={styles.titleText} numberOfLines={1}>
            {getHeaderTitle()}
          </Text>
        </View>

        {/* Lado derecho: Carrito y Usuario */}
        <View style={styles.rightSection}>
          {/* Botón Carrito con contador */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Checkout')}
            style={styles.cartButton}
          >
            <Ionicons name="cart-outline" size={24} color="#374151" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {itemCount > 99 ? '99+' : itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Botón Usuario con indicador de sesión */}
          <TouchableOpacity
            onPress={handleUserPress}
            style={styles.userButton}
          >
            <View style={styles.userIconContainer}>
              <Ionicons
                name={isAuthenticated ? "person" : "person-outline"}
                size={24}
                color={isAuthenticated ? "#3b82f6" : "#374151"}
              />
              {isAuthenticated && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de bienvenida si está autenticado */}
      {isAuthenticated && route.name === 'Home' && (
        <View style={styles.welcomeBar}>
          <Text style={styles.welcomeText}>
            Hola, {user?.nombres || 'Usuario'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },

  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },

  centerSection: {
    flex: 2,
    alignItems: 'center',
  },

  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    padding: 8,
  },

  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },

  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },

  cartButton: {
    padding: 8,
    position: 'relative',
  },

  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  userButton: {
    padding: 8,
  },

  userIconContainer: {
    position: 'relative',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  welcomeBar: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },

  welcomeText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '500',
  },
});

export default Header;
