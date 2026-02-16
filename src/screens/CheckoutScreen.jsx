import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import { globalStyles } from '../styles/globalStyles';

const CheckoutScreen = ({ navigation }) => {
  const { items, total, clearCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address form
  const [formData, setFormData] = useState({
    direccion: '',
    ciudad: '',
    zip: '',
    country: 'Venezuela',
    telefono: '',
  });

  // Payment
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [transaccion, setTransaccion] = useState('');
  const [bancos, setBancos] = useState([]);
  const [banco, setBanco] = useState('');

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Order complete
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    loadAddresses();
    loadBancos();
  }, []);

  const loadAddresses = async () => {
    if (!user) return;
    setAddressesLoading(true);
    try {
      const data = await ApiService.getAddresses(user.id);
      setAddresses(data || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const loadBancos = async () => {
    try {
      const data = await ApiService.getBancos();
      setBancos(data || []);
    } catch (err) {
      console.error('Error loading bancos:', err);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
  };

  const handleCreateAddress = async () => {
    if (!formData.direccion || !formData.ciudad || !formData.zip || !formData.telefono) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const newAddress = {
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        zip: formData.zip,
        pais: formData.country,
        telefono: formData.telefono,
        clienteId: user.id,
      };

      const createdAddress = await ApiService.createAddress(newAddress);
      await loadAddresses();
      setSelectedAddressId(createdAddress.id);
      setShowAddressForm(false);
      setFormData(prev => ({ ...prev, direccion: '', ciudad: '', zip: '', telefono: '' }));
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear la direccion');
      console.error('Error creating address:', err);
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

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return user?.nombres && user?.apellidos && user?.email;
      case 2:
        return !!selectedAddressId;
      case 3:
        if (formaPago === 'Efectivo' || formaPago === 'Pago al recibir') {
          return !!formaPago;
        } else if (formaPago === 'Pago Movil' || formaPago === 'Transferencia Bancaria') {
          return !!(formaPago && banco && transaccion);
        }
        return false;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    const orderData = {
      detalles: items.map(item => ({
        productoId: item.productoId,
        variedadId: item.variedadId,
        cantidad: item.cantidad,
        precio_unidad: item.precio,
      })),
      subtotal: total,
      envio: 0,
      total: total,
      forma_pago: formaPago,
      transaccion: transaccion,
      clienteId: user.id,
      bancoId: banco,
      direccionId: selectedAddressId,
    };

    try {
      const result = await ApiService.createVenta(orderData);
      setOrderId(result.id || result.nventa);
      setOrderComplete(true);
      await clearCart();
    } catch (err) {
      setError('Error al procesar el pedido. Intentalo de nuevo.');
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (items.length === 0 && !orderComplete) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
        <Text style={styles.emptyText}>Agrega algunos productos antes de proceder al checkout</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.emptyButtonText}>Explorar Productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Order complete
  if (orderComplete) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Pedido Confirmado!</Text>
        <Text style={styles.successText}>
          Tu pedido #{orderId} ha sido procesado exitosamente.
          Recibiras un email de confirmacion en breve.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.emptyButtonText}>Ver Mis Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.outlineButtonText}>Continuar Comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              step >= stepNumber && styles.progressCircleActive,
            ]}>
              <Text style={[
                styles.progressNumber,
                step >= stepNumber && styles.progressNumberActive,
              ]}>
                {stepNumber}
              </Text>
            </View>
            {stepNumber < 3 && (
              <View style={[
                styles.progressLine,
                step > stepNumber && styles.progressLineActive,
              ]} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>Personal</Text>
        <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>Direccion</Text>
        <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>Pago</Text>
      </View>

      {/* Step Content */}
      <View style={styles.stepContent}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <View>
            <View style={styles.stepHeader}>
              <Ionicons name="person-outline" size={24} color="#3b82f6" />
              <Text style={styles.stepTitle}>Informacion Personal</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.nombres || ''}
                editable={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Apellidos</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.apellidos || ''}
                editable={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ''}
                editable={false}
              />
            </View>
          </View>
        )}

        {/* Step 2: Shipping Address */}
        {step === 2 && (
          <View>
            <View style={styles.stepHeader}>
              <Ionicons name="location-outline" size={24} color="#3b82f6" />
              <Text style={styles.stepTitle}>Direccion de Envio</Text>
            </View>

            {addressesLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.sectionSubtitle}>Seleccione una Direccion</Text>

                {addresses.length > 0 ? (
                  addresses.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.addressCard,
                        selectedAddressId === item.id && styles.addressCardSelected,
                      ]}
                      onPress={() => handleAddressSelect(item)}
                    >
                      <View style={styles.addressRow}>
                        {selectedAddressId === item.id && (
                          <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.addressText}>{item.direccion}</Text>
                          <Text style={styles.addressSubtext}>
                            {item.ciudad}, {item.pais} | Tel: {item.telefono}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noAddressText}>No tienes direcciones guardadas.</Text>
                )}

                <TouchableOpacity
                  style={styles.newAddressButton}
                  onPress={() => setShowAddressForm(!showAddressForm)}
                >
                  <Ionicons name={showAddressForm ? 'close' : 'add'} size={20} color="#3b82f6" />
                  <Text style={styles.newAddressButtonText}>
                    {showAddressForm ? 'Cancelar' : 'Nueva Direccion'}
                  </Text>
                </TouchableOpacity>

                {showAddressForm && (
                  <View style={styles.addressForm}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Direccion</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.direccion}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, direccion: text }))}
                        placeholder="Ingrese su direccion"
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Pais</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.country}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                          style={styles.picker}
                        >
                          <Picker.Item label="Venezuela" value="Venezuela" />
                          <Picker.Item label="Colombia" value="Colombia" />
                          <Picker.Item label="Mexico" value="Mexico" />
                          <Picker.Item label="Argentina" value="Argentina" />
                          <Picker.Item label="Chile" value="Chile" />
                          <Picker.Item label="Peru" value="Peru" />
                          <Picker.Item label="Ecuador" value="Ecuador" />
                          <Picker.Item label="España" value="España" />
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.rowFields}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>Ciudad</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.ciudad}
                          onChangeText={(text) => setFormData(prev => ({ ...prev, ciudad: text }))}
                          placeholder="Ciudad"
                        />
                      </View>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>Codigo Postal</Text>
                        <TextInput
                          style={styles.input}
                          value={formData.zip}
                          onChangeText={(text) => setFormData(prev => ({ ...prev, zip: text }))}
                          placeholder="ZIP"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Telefono</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.telefono}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, telefono: text }))}
                        placeholder="Telefono"
                        keyboardType="phone-pad"
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.saveAddressButton,
                        (!formData.direccion || !formData.ciudad || !formData.zip || !formData.telefono) && styles.buttonDisabled,
                      ]}
                      onPress={handleCreateAddress}
                      disabled={!formData.direccion || !formData.ciudad || !formData.zip || !formData.telefono || loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveAddressButtonText}>Guardar Direccion</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <View>
            <View style={styles.stepHeader}>
              <Ionicons name="card-outline" size={24} color="#3b82f6" />
              <Text style={styles.stepTitle}>Forma de Pago</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Metodo de Pago</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formaPago}
                  onValueChange={(value) => setFormaPago(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Efectivo" value="Efectivo" />
                  <Picker.Item label="Pago Movil" value="Pago Movil" />
                  <Picker.Item label="Transferencia Bancaria" value="Transferencia Bancaria" />
                  <Picker.Item label="Pago al recibir" value="Pago al recibir" />
                </Picker>
              </View>
            </View>

            {(formaPago === 'Pago Movil' || formaPago === 'Transferencia Bancaria') && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Banco</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={banco}
                      onValueChange={(value) => setBanco(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Seleccione un banco" value="" />
                      {bancos.map((bancoItem) => (
                        <Picker.Item
                          key={bancoItem.id}
                          label={bancoItem.nombre}
                          value={bancoItem.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Referencia de Pago</Text>
                  <TextInput
                    style={styles.input}
                    value={transaccion}
                    onChangeText={setTransaccion}
                    placeholder="Numero de referencia"
                  />
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumen del Pedido</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <Image
              source={{ uri: ApiService.getProductImageUrl(item.productos?.portada) }}
              style={styles.summaryItemImage}
            />
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.productos?.titulo || item.name}
              </Text>
              <Text style={styles.summaryItemDetail}>
                Cant: {item.cantidad} x {formatPrice(item.precio)}
              </Text>
            </View>
            <Text style={styles.summaryItemPrice}>
              {formatPrice(item.precio * item.cantidad)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envio</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>Gratis</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.prevButton}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.prevButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !validateStep(step) && styles.buttonDisabled,
            ]}
            onPress={handleNextStep}
            disabled={!validateStep(step)}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!validateStep(step) || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmitOrder}
            disabled={!validateStep(step) || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Empty / Success states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  // Progress bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#3b82f6',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 60,
    height: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3b82f6',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  progressLabelActive: {
    color: '#3b82f6',
  },
  // Step content
  stepContent: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  // Fields
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  // Address cards
  addressCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  addressCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#EFF6FF',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  addressSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  noAddressText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  newAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 8,
  },
  newAddressButtonText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '500',
  },
  addressForm: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  saveAddressButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Order summary
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  summaryItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  summaryItemDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  // Error
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  // Navigation buttons
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  prevButtonText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CheckoutScreen;
