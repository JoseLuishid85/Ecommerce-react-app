import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();

  // Datos de características
  const features = [
    {
      title: 'Envío Rápido',
      description: 'Recibe tus productos en 24-48 horas',
      icon: '🚚'
    },
    {
      title: 'Calidad Garantizada',
      description: 'Productos verificados y de alta calidad',
      icon: '✨'
    },
    {
      title: 'Soporte 24/7',
      description: 'Atención al cliente siempre disponible',
      icon: '💬'
    }
  ];

  // Productos destacados
  const featuredProducts = [
    {
      id: '1',
      name: 'Smartphone Premium',
      price: 299.99,
      image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Smartphone',
      category: 'Tecnología'
    },
    {
      id: '2',
      name: 'Audífonos Bluetooth',
      price: 89.99,
      image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Audífonos',
      category: 'Audio'
    },
    {
      id: '3',
      name: 'Smart Watch',
      price: 159.99,
      image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Smart+Watch',
      category: 'Wearables'
    }
  ];

  // Categorías
  const categories = [
    {
      id: '1',
      name: 'Tecnología',
      icon: '📱',
      count: '120 productos'
    },
    {
      id: '2',
      name: 'Hogar',
      icon: '🏠',
      count: '85 productos'
    },
    {
      id: '3',
      name: 'Moda',
      icon: '👕',
      count: '200 productos'
    },
    {
      id: '4',
      name: 'Deportes',
      icon: '⚽',
      count: '75 productos'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Bienvenido a{' '}
          <Text style={styles.heroTitleAccent}>Ecommerce</Text>
        </Text>
        
        <Text style={styles.heroSubtitle}>
          Descubre miles de productos de calidad con los mejores precios. 
          Tu experiencia de compra perfecta comienza aquí.
        </Text>
        
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.primaryButtonText}>Explorar Productos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Offers')}
          >
            <Text style={styles.secondaryButtonText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Por qué elegirnos?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías populares</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Productos Destacados */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.productsScroll}
        >
          {featuredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { 
                slug: product.id,
                product: product 
              })}
            >
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>${product.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Banner de Oferta */}
      <View style={styles.offerBanner}>
        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>Oferta Especial</Text>
          <Text style={styles.offerDescription}>Hasta 50% de descuento en productos seleccionados</Text>
          <TouchableOpacity 
            style={styles.offerButton}
            onPress={() => navigation.navigate('Offers')}
          >
            <Text style={styles.offerButtonText}>Ver Ofertas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 40,
  },
  
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  heroTitleAccent: {
    color: '#3B82F6',
  },
  
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    padding: 24,
    paddingBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Features
  featuresGrid: {
    gap: 16,
  },
  
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Categories
  categoriesScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  
  categoryIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  categoryCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Products
  productsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  
  productImage: {
    width: '100%',
    height: 160,
  },
  
  productInfo: {
    padding: 16,
  },
  
  productCategory: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  
  // Offer Banner
  offerBanner: {
    margin: 24,
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 24,
  },
  
  offerContent: {
    alignItems: 'center',
  },
  
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  
  offerDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  
  offerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  offerButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;