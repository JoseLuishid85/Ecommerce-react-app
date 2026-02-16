import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importar providers
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Importar el Header
import Header from './src/components/Header';

// Importar pantallas básicas
import HomeScreen from './src/screens/HomeScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import OrdersScreen from './src/screens/OrdersScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                header: (props) => <Header {...props} />,
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Products" component={ProductListScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="Login" component={AuthScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />

              <Stack.Screen name="Categories" component={PlaceholderScreen} />
              <Stack.Screen name="Offers" component={PlaceholderScreen} />
              <Stack.Screen name="Contact" component={PlaceholderScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
