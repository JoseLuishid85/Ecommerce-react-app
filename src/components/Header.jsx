import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ navigation }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const getHeaderTitle = () => {
    const routeName = route.name;
    
    const titles = {
      Home: 'Inicio',
      Products: 'Productos',
      ProductDetail: 'Detalle',
      Checkout: 'Checkout',
      Login: 'Iniciar Sesión',
      Categories: 'Categorías',
      Offers: 'Ofertas',
      Contact: 'Contacto',
      Orders: 'Mis Pedidos',
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

  const showBackButton = route.name !== 'Home';

  return (
    <View style={[styles.headerContainer, { height: 60 + insets.top, paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        {/* Lado izquierdo: Logo/Botón Retroceso */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
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
          <TouchableOpacity 
            onPress={() => navigation.navigate('Checkout')}
            style={styles.cartButton}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.userButton}
          >
            <Text style={styles.userIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    gap: 16,
  },
  
  backButton: {
    padding: 8,
  },
  
  backIcon: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
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
  },
  
  cartIcon: {
    fontSize: 20,
  },
  
  userButton: {
    padding: 8,
  },
  
  userIcon: {
    fontSize: 20,
  },
});

export default Header;