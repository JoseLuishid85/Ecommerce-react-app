import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
  const { product: initialProduct } = route.params || {};
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTalla, setSelectedTalla] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (!initialProduct && route.params?.slug) {
      loadProduct(route.params.slug);
    }
  }, []);

  const loadProduct = async (slug) => {
    try {
      setLoading(true);
      const data = await ApiService.getProduct(slug);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleAddToCart = async () => {
    let variedadId = null;

    if (product.variedades?.length > 0) {
      const variedad = product.variedades.find(
        (variant) =>
          variant.talla === selectedTalla && variant.color === selectedColor
      );
      if (variedad) {
        variedadId = variedad.id;
      }
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(product, quantity, variedadId);

      if (result.requiresAuth) {
        Alert.alert(
          'Iniciar Sesión',
          'Debes iniciar sesión para agregar productos al carrito',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
          ]
        );
      } else if (result.success) {
        Alert.alert(
          'Agregado al Carrito',
          `${product.titulo} se agregó correctamente al carrito`,
          [
            { text: 'Seguir Comprando', style: 'cancel' },
            { text: 'Ver Carrito', onPress: () => navigation.navigate('Checkout') },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo agregar el producto');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Ocurrió un error al agregar el producto');
    } finally {
      setAddingToCart(false);
    }
  };

  const getImages = () => {
    if (!product) return [];

    const images = [];

    // Imagen principal
    if (product.portada) {
      images.push(ApiService.getProductImageUrl(product.portada));
    }

    // Galería
    if (product.galerias?.length > 0) {
      product.galerias.forEach((galeria) => {
        images.push(
          `${process.env.EXPO_PUBLIC_API_URL}/producto/obtener_galeria_producto/${galeria.image}`
        );
      });
    }

    return images;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Producto no encontrado</Text>
        <Text style={styles.errorText}>{error || 'El producto que buscas no existe'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.backButtonText}>Volver a productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = getImages();
  const tallas = product.talla && product.variedades?.length > 0
    ? [...new Set(product.variedades.map((v) => v.talla).filter(Boolean))]
    : [];
  const colores = product.color && product.variedades?.length > 0
    ? [...new Set(product.variedades.map((v) => v.color).filter(Boolean))]
    : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con botón volver */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backButtonHeaderText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Galería de imágenes */}
      <View style={styles.imageSection}>
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: images[selectedImage] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-social-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Miniaturas */}
        {images.length > 1 && (
          <FlatList
            horizontal
            data={images}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailActive,
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Información del producto */}
      <View style={styles.infoSection}>
        {/* Título */}
        <Text style={styles.productTitle}>{product.titulo}</Text>

        {/* Rating (si existe) */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={18}
                  color={i < Math.floor(product.rating) ? '#FBBF24' : '#D1D5DB'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount} reseñas)</Text>
          </View>
        )}

        {/* Precio */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(product.precio)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
          )}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Tallas */}
        {tallas.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={styles.variantTitle}>Talla:</Text>
            <View style={styles.variantOptions}>
              {tallas.map((talla) => (
                <TouchableOpacity
                  key={talla}
                  style={[
                    styles.variantButton,
                    selectedTalla === talla && styles.variantButtonActive,
                  ]}
                  onPress={() => setSelectedTalla(talla)}
                >
                  <Text
                    style={[
                      styles.variantButtonText,
                      selectedTalla === talla && styles.variantButtonTextActive,
                    ]}
                  >
                    {talla}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Colores */}
        {colores.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={styles.variantTitle}>Color:</Text>
            <View style={styles.variantOptions}>
              {colores.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.variantButton,
                    selectedColor === color && styles.variantButtonActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <Text
                    style={[
                      styles.variantButtonText,
                      selectedColor === color && styles.variantButtonTextActive,
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Selección mostrada */}
        {selectedTalla && selectedColor && (
          <View style={styles.selectionBanner}>
            <Text style={styles.selectionText}>
              Has seleccionado: Talla {selectedTalla}, Color {selectedColor}
            </Text>
          </View>
        )}

        {/* Cantidad */}
        <View style={styles.quantitySection}>
          <Text style={styles.variantTitle}>Cantidad:</Text>
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            {product.stock && (
              <Text style={styles.stockText}>{product.stock} disponibles</Text>
            )}
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.addToCartButton, addingToCart && styles.buttonDisabled]}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
                <Text style={styles.addToCartText}>
                  {isAuthenticated ? 'Agregar al Carrito' : 'Iniciar Sesión para Comprar'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButton, !isAuthenticated && styles.buyNowButtonDisabled]}
            onPress={() => {
              if (!isAuthenticated) {
                Alert.alert(
                  'Iniciar Sesión',
                  'Debes iniciar sesión para comprar',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
                  ]
                );
              } else {
                // Lógica para comprar ahora
                handleAddToCart();
                navigation.navigate('Checkout');
              }
            }}
          >
            <Text style={[styles.buyNowText, !isAuthenticated && styles.buyNowTextDisabled]}>
              Comprar Ahora
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="car-outline" size={22} color="#16A34A" />
            <Text style={styles.infoItemText}>Envío gratis en pedidos superiores a 50€</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#2563EB" />
            <Text style={styles.infoItemText}>Garantía de 2 años</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="refresh-outline" size={22} color="#9333EA" />
            <Text style={styles.infoItemText}>Devoluciones gratuitas en 30 días</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Descripción:</Text>
          <Text style={styles.descriptionText}>{product.extracto}</Text>
        </View>
      </View>
    </ScrollView>
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
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonHeaderText: {
    fontSize: 16,
    color: '#374151',
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
  },
  mainImageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 24,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 24,
  },
  thumbnailList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: '#2563EB',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  discountText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  variantSection: {
    marginBottom: 20,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  variantButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  variantButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  variantButtonTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  selectionBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  selectionText: {
    color: '#1E40AF',
    fontSize: 14,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stockText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buyNowText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buyNowButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  buyNowTextDisabled: {
    color: '#9CA3AF',
  },
  additionalInfo: {
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItemText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  descriptionSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
});

export default ProductDetailScreen;
