import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

const OrdersScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderTotals, setOrderTotals] = useState({
    totalPedidos: 0,
    enProceso: 0,
    entregados: 0,
    pendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getMyOrders();
      setOrderTotals(response.totales);
      setOrders(response.ventas);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('No se pudieron cargar tus pedidos. Intentalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, loadOrders]);

  const getStatusInfo = (estado) => {
    const statusMap = {
      'Pendiente': {
        label: 'Pendiente',
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        borderColor: '#FDE68A',
        icon: 'time-outline',
      },
      'En Proceso': {
        label: 'En Proceso',
        bgColor: '#DBEAFE',
        textColor: '#1E40AF',
        borderColor: '#BFDBFE',
        icon: 'cube-outline',
      },
      'Enviado': {
        label: 'Enviado',
        bgColor: '#EDE9FE',
        textColor: '#6D28D9',
        borderColor: '#DDD6FE',
        icon: 'car-outline',
      },
      'Entregado': {
        label: 'Entregado',
        bgColor: '#D1FAE5',
        textColor: '#065F46',
        borderColor: '#A7F3D0',
        icon: 'checkmark-circle-outline',
      },
    };
    return statusMap[estado] || statusMap['Pendiente'];
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return '$' + Number(price).toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          Hola {user?.nombres || 'Usuario'}, aqui puedes ver el estado de todos tus pedidos
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {[
          { label: 'Total', value: orderTotals.totalPedidos, icon: 'bag-outline', color: '#3b82f6', bgColor: '#DBEAFE' },
          { label: 'En Proceso', value: orderTotals.enProceso, icon: 'car-outline', color: '#8B5CF6', bgColor: '#EDE9FE' },
          { label: 'Entregados', value: orderTotals.entregados, icon: 'checkmark-circle-outline', color: '#10B981', bgColor: '#D1FAE5' },
          { label: 'Pendientes', value: orderTotals.pendientes, icon: 'time-outline', color: '#F59E0B', bgColor: '#FEF3C7' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No tienes pedidos aun</Text>
          <Text style={styles.emptyText}>Explora nuestros productos y realiza tu primera compra</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.shopButtonText}>Ver Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.estado);
            const isExpanded = expandedOrder === order.id;
            const itemsCount = order.detalles?.length || 0;

            const formattedDate = new Date(order.year, order.month - 1, order.day).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <TouchableOpacity
                  style={styles.orderHeader}
                  onPress={() => toggleOrderDetails(order.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeaderLeft}>
                    <View style={styles.orderTitleRow}>
                      <Text style={styles.orderNumber}>{order.nventa}</Text>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusInfo.bgColor,
                          borderColor: statusInfo.borderColor,
                        },
                      ]}>
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.textColor} />
                        <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderDate}>Fecha: {formattedDate}</Text>
                  </View>

                  <View style={styles.orderHeaderRight}>
                    <Text style={styles.orderTotalLabel}>Total</Text>
                    <Text style={styles.orderTotalValue}>{formatPrice(order.total)}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.orderDetails}>
                    <View style={styles.detailsDivider} />

                    {/* Products */}
                    <Text style={styles.detailsSectionTitle}>Productos ({itemsCount})</Text>
                    {itemsCount > 0 ? (
                      order.detalles.map((detalle, detIndex) => (
                        <View key={detIndex} style={styles.productRow}>
                          <Image
                            source={{
                              uri: ApiService.getProductImageUrl(detalle.producto?.portada),
                            }}
                            style={styles.productImage}
                          />
                          <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>
                              {detalle.producto?.titulo}
                            </Text>
                            <Text style={styles.productQty}>Cantidad: {detalle.cantidad}</Text>
                          </View>
                          <Text style={styles.productPrice}>
                            {formatPrice(detalle.precio_unidad * detalle.cantidad)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDetailsText}>No hay detalles disponibles.</Text>
                    )}

                    {/* Address & Payment */}
                    <View style={styles.infoCards}>
                      {order.direccion && (
                        <View style={styles.infoCard}>
                          <Text style={styles.infoCardTitle}>Direccion de Envio</Text>
                          <Text style={styles.infoCardText}>
                            {order.direccion.direccion}, {order.direccion.ciudad}, {order.direccion.pais}
                          </Text>
                          <Text style={styles.infoCardText}>Tel: {order.direccion.telefono}</Text>
                        </View>
                      )}

                      <View style={styles.infoCard}>
                        <Text style={styles.infoCardTitle}>Metodo de Pago</Text>
                        <Text style={[styles.infoCardText, { fontWeight: '600' }]}>
                          {order.forma_pago}
                        </Text>
                        {(order.banco || order.transaccion) && (
                          <Text style={styles.infoCardText}>Ref: {order.transaccion}</Text>
                        )}
                        <View style={styles.orderTotals}>
                          <Text style={styles.infoCardText}>Subtotal: {formatPrice(order.subtotal)}</Text>
                          <Text style={styles.infoCardText}>Envio: {formatPrice(order.envio)}</Text>
                          <Text style={[styles.infoCardText, { fontWeight: 'bold' }]}>
                            Total: {formatPrice(order.total)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  // Orders list
  ordersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  // Order details
  orderDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  productQty: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  noDetailsText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  // Info cards
  infoCards: {
    gap: 10,
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderTotals: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
});

export default OrdersScreen;
