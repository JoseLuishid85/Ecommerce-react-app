import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductListScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || '');
  const [sortBy, setSortBy] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.categoriaId !== parseInt(selectedCategory)) {
      return false;
    }
    if (searchTerm && !product.titulo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.precio - b.precio;
      case 'price_desc':
        return b.precio - a.precio;
      default:
        return 0;
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, viewMode === 'list' && styles.productCardList]}
      onPress={() => handleViewProduct(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, viewMode === 'list' && styles.imageContainerList]}>
        <Image
          source={{ uri: ApiService.getProductImageUrl(item.portada) }}
          style={[styles.productImage, viewMode === 'list' && styles.productImageList]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={[styles.productInfo, viewMode === 'list' && styles.productInfoList]}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.productExcerpt} numberOfLines={2}>
          {item.extracto}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.precio)}</Text>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewProduct(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
          <Text style={styles.viewButtonText}>Ver Producto</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error al cargar productos</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header de filtros */}
      <View style={styles.filterHeader}>
        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filtros rápidos */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              const nextSort = sortBy === '' ? 'price_asc' : sortBy === 'price_asc' ? 'price_desc' : '';
              setSortBy(nextSort);
            }}
          >
            <Ionicons name="swap-vertical-outline" size={18} color="#6B7280" />
            <Text style={styles.filterButtonText}>
              {sortBy === 'price_asc' ? 'Menor precio' : sortBy === 'price_desc' ? 'Mayor precio' : 'Ordenar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? '#2563EB' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? '#2563EB' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Categorías horizontales */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {[{ id: '', nombre: 'Todas' }, ...categories].map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={[
                styles.categoryChip,
                selectedCategory === item.id.toString() && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item.id.toString())}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item.id.toString() && styles.categoryChipTextActive,
                ]}
              >
                {item.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contador de resultados */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Productos</Text>
        <Text style={styles.resultsCount}>{sortedProducts.length} productos encontrados</Text>
      </View>

      {/* Lista de productos */}
      {sortedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No se encontraron productos</Text>
          <Text style={styles.emptyText}>
            Intenta ajustar tus filtros de búsqueda
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={renderProductCard}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 52,
  },
  categoriesList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 52,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  productCardList: {
    width: '100%',
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  imageContainerList: {
    width: 120,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  productImageList: {
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 20,
  },
  productInfo: {
    padding: 12,
  },
  productInfoList: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productExcerpt: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ProductListScreen;
