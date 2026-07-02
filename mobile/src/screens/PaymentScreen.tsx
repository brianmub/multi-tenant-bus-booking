import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface PaymentScreenProps {
  schedule: any;
  travelDate: string;
  selectedSeats: string[];
  passengers: any[];
  currency: string;
  onPaymentSuccess: (bookingId: string) => void;
  onGoBack: () => void;
}

export default function PaymentScreen({
  schedule,
  travelDate,
  selectedSeats,
  passengers,
  currency,
  onPaymentSuccess,
  onGoBack,
}: PaymentScreenProps) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  // Price Calculations
  const isZar = currency === 'ZAR';
  const singlePrice = parseFloat(schedule.price_usd);
  const conversionRate = 18.5; // ZAR per USD

  const subtotalUSD = singlePrice * selectedSeats.length;
  const serviceFeeUSD = 1.50;
  const taxRate = 0.15; // 15%
  const taxUSD = subtotalUSD * taxRate;
  const totalUSD = subtotalUSD + serviceFeeUSD + taxUSD;

  // Conversion
  const formatPrice = (usdAmount: number) => {
    if (isZar) {
      return `R ${(usdAmount * conversionRate).toFixed(0)}`;
    }
    return `$ ${usdAmount.toFixed(2)}`;
  };

  const handlePay = async () => {
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      Alert.alert('Error', 'Please fill in all credit card details');
      return;
    }

    setLoading(true);
    try {
      const bookingId = `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Insert directly into Supabase bookings table
      // Passing native objects for JSONB columns, not strings.
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            id: bookingId,
            bus_id: schedule.bus_id,
            bus_reg: schedule.bus_id,
            bus_class: 'Semi-Sleeper',
            route_from: schedule.route_from,
            route_to: schedule.route_to,
            travel_date: travelDate,
            departure_time: schedule.departure_time,
            seats: selectedSeats,
            passengers: passengers,
            subtotal: subtotalUSD,
            tax: taxUSD,
            service_fee: serviceFeeUSD,
            total: totalUSD,
            currency: currency,
            payment_method: 'card',
          }
        ]);

      if (error) throw error;

      Alert.alert(
        'Booking Confirmed! 🎫',
        `Your booking reference is ${bookingId}.\n\n💬 A simulated copy of your ticket details has been sent to your WhatsApp number and email.`,
        [
          {
            text: 'View Ticket',
            onPress: () => onPaymentSuccess(bookingId)
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Could not complete the transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.routeHeader}>
            <Text style={styles.routeName}>{schedule.route_from} ➔ {schedule.route_to}</Text>
            <Text style={styles.routeDate}>{travelDate} • {schedule.departure_time}</Text>
          </View>

          <View style={styles.divider} />

          {/* Pricing breakdown */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tickets ({selectedSeats.length} seats: {selectedSeats.join(', ')})</Text>
            <Text style={styles.priceValue}>{formatPrice(subtotalUSD)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>{formatPrice(serviceFeeUSD)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>VAT / Taxes (15%)</Text>
            <Text style={styles.priceValue}>{formatPrice(taxUSD)}</Text>
          </View>

          <View style={[styles.divider, { marginVertical: 12 }]} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalUSD)}</Text>
          </View>
        </View>

        {/* Card Entry Form */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Credit or Debit Card</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={setCardNumber}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={5}
                value={expiry}
                onChangeText={setExpiry}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>

          <Text style={styles.secureText}>🔒 Secure payment simulated gateway. Real funds will not be charged.</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Text style={styles.payButtonText}>Pay {formatPrice(totalUSD)}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  backText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#292929',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  routeHeader: {
    marginBottom: 12,
  },
  routeName: {
    color: '#d4af37',
    fontSize: 15,
    fontWeight: '700',
  },
  routeDate: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#282828',
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#888',
    fontSize: 13,
  },
  priceValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: '900',
  },
  paymentCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#292929',
  },
  paymentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
  },
  secureText: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  payButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
});
