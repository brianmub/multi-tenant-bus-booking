import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface SeatMapScreenProps {
  schedule: any;
  travelDate: string;
  currency: string;
  onConfirmSeats: (seats: string[]) => void;
  onGoBack: () => void;
}

export default function SeatMapScreen({ schedule, travelDate, currency, onConfirmSeats, onGoBack }: SeatMapScreenProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Generate 40 seats (10 rows, columns A, B, C, D)
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const cols = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    async function fetchBookedSeats() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('seats')
          .eq('bus_id', schedule.bus_id)
          .eq('travel_date', travelDate);

        if (error) throw error;

        const booked = new Set<string>();
        if (data) {
          data.forEach((booking: any) => {
            let seatsList = booking.seats;
            if (typeof seatsList === 'string') {
              try {
                seatsList = JSON.parse(seatsList);
              } catch {
                seatsList = [];
              }
            }
            if (Array.isArray(seatsList)) {
              seatsList.forEach((s) => booked.add(s));
            }
          });
        }
        setBookedSeats(booked);
      } catch (err: any) {
        console.warn('Failed to load booked seats, defaulting to none:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookedSeats();
  }, [schedule.bus_id, travelDate]);

  const toggleSeat = (seatLabel: string) => {
    if (bookedSeats.has(seatLabel)) return;

    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
    } else {
      if (selectedSeats.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 seats per booking');
        return;
      }
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat to continue');
      return;
    }
    onConfirmSeats(selectedSeats);
  };

  const getPrice = () => {
    const singlePrice = parseFloat(schedule.price_usd);
    const totalPrice = singlePrice * selectedSeats.length;
    if (currency === 'ZAR') {
      return `R ${(totalPrice * 18.5).toFixed(0)}`;
    }
    return `$ ${totalPrice.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Select Seats</Text>
          <Text style={styles.headerSubtitle}>{schedule.departure_time} • {schedule.bus_id}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Seat Map Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Loading seat layout...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.seatLegend, styles.availableSeat]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.seatLegend, styles.selectedSeat]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.seatLegend, styles.bookedSeat]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          {/* Steering wheel representation */}
          <View style={styles.frontIndicator}>
            <Text style={styles.frontIndicatorText}>🚌 FRONT OF BUS</Text>
          </View>

          {/* Seat Grid */}
          <View style={styles.busLayout}>
            {rows.map((row) => (
              <View key={`row-${row}`} style={styles.row}>
                {/* Left Side: A, B */}
                <View style={styles.sideCol}>
                  {['A', 'B'].map((col) => {
                    const label = `${row}${col}`;
                    const isBooked = bookedSeats.has(label);
                    const isSelected = selectedSeats.includes(label);

                    return (
                      <TouchableOpacity
                        key={label}
                        activeOpacity={isBooked ? 1 : 0.6}
                        style={[
                          styles.seat,
                          isBooked && styles.bookedSeat,
                          isSelected && styles.selectedSeat,
                        ]}
                        onPress={() => toggleSeat(label)}
                      >
                        <Text style={[
                          styles.seatLabel,
                          (isBooked || isSelected) && styles.seatLabelWhite
                        ]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Aisle */}
                <View style={styles.aisle}>
                  <Text style={styles.aisleText}>{row}</Text>
                </View>

                {/* Right Side: C, D */}
                <View style={styles.sideCol}>
                  {['C', 'D'].map((col) => {
                    const label = `${row}${col}`;
                    const isBooked = bookedSeats.has(label);
                    const isSelected = selectedSeats.includes(label);

                    return (
                      <TouchableOpacity
                        key={label}
                        activeOpacity={isBooked ? 1 : 0.6}
                        style={[
                          styles.seat,
                          isBooked && styles.bookedSeat,
                          isSelected && styles.selectedSeat,
                        ]}
                        onPress={() => toggleSeat(label)}
                      >
                        <Text style={[
                          styles.seatLabel,
                          (isBooked || isSelected) && styles.seatLabelWhite
                        ]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Booking Summary Panel */}
      <View style={styles.summaryPanel}>
        <View style={styles.summaryDetails}>
          <View>
            <Text style={styles.seatsCountText}>
              {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
            </Text>
            <Text style={styles.seatsListText}>
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPriceLabel}>Total Price</Text>
            <Text style={styles.totalPriceValue}>{getPrice()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.confirmCTA, selectedSeats.length === 0 && styles.disabledCTA]} 
          onPress={handleConfirm}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.confirmCTAText}>Confirm Seats</Text>
        </TouchableOpacity>
      </View>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: '600',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#a0a0a0',
    marginTop: 16,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#292929',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatLegend: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '600',
  },
  frontIndicator: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  frontIndicatorText: {
    color: '#666',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 2,
  },
  busLayout: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sideCol: {
    flexDirection: 'row',
    gap: 10,
  },
  aisle: {
    width: 48,
    alignItems: 'center',
  },
  aisleText: {
    color: '#444',
    fontWeight: '800',
    fontSize: 13,
  },
  seat: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    borderWidth: 1.5,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableSeat: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1.5,
    borderColor: '#444',
  },
  selectedSeat: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  bookedSeat: {
    backgroundColor: '#3d1616',
    borderColor: '#a83232',
  },
  seatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a0a0a0',
  },
  seatLabelWhite: {
    color: '#121212',
  },
  summaryPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#292929',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatsCountText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  seatsListText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceLabel: {
    color: '#a0a0a0',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalPriceValue: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  confirmCTA: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledCTA: {
    backgroundColor: '#333333',
  },
  confirmCTAText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
});
