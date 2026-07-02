import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { getBookings } from '../utils/storage';

const { width } = Dimensions.get('window');

interface BookingsScreenProps {
  currency: string;
  onGoBack: () => void;
}

export default function BookingsScreen({ currency, onGoBack }: BookingsScreenProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    const history = await getBookings();
    setBookings(history);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatPrice = (usdAmount: number) => {
    if (currency === 'ZAR') {
      return `R ${(usdAmount * 18.5).toFixed(0)}`;
    }
    return `$ ${usdAmount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const options: any = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchHistory}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Fetching your tickets...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noBookingsIcon}>🎟️</Text>
          <Text style={styles.noBookingsTitle}>No Bookings Found</Text>
          <Text style={styles.noBookingsDesc}>
            You haven't booked any bus trips yet. Go search and reserve your seats now!
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={onGoBack}>
            <Text style={styles.actionButtonText}>Book a Bus</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.ticketCard}
              activeOpacity={0.8}
              onPress={() => setSelectedTicket(booking)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.ticketRef}>{booking.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.routeRow}>
                  <View style={styles.cityCol}>
                    <Text style={styles.timeText}>{booking.departureTime}</Text>
                    <Text style={styles.cityText}>{booking.from}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>➔</Text>
                  <View style={[styles.cityCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timeText}>Next Day</Text>
                    <Text style={styles.cityText}>{booking.to}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View>
                    <Text style={styles.detailLabel}>Travel Date</Text>
                    <Text style={styles.detailVal}>{formatDate(booking.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.detailLabel}>Seats ({booking.seats?.length || 0})</Text>
                    <Text style={styles.detailVal}>{booking.seats?.join(', ')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.tapPrompt}>Tap to view digital ticket</Text>
                <Text style={styles.totalPrice}>{formatPrice(booking.total)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedTicket}
          onRequestClose={() => setSelectedTicket(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Ticket Dispatched Banner */}
              <View style={styles.notificationBanner}>
                <Text style={styles.notificationEmoji}>💬</Text>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>TICKET DISPATCHED</Text>
                  <Text style={styles.notificationText}>
                    Simulated ticket details sent to WhatsApp at +263 77 123 4567 and passenger email accounts.
                  </Text>
                </View>
              </View>

              {/* Ticket Body */}
              <View style={styles.ticketWrapper}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketCompany}>GENESIS BUS COMPANY</Text>
                  <Text style={styles.ticketType}>OFFICIAL BOARDING PASS</Text>
                </View>

                <View style={styles.ticketInfoSection}>
                  <View style={styles.modalRouteRow}>
                    <View>
                      <Text style={styles.modalLabel}>FROM</Text>
                      <Text style={styles.modalCity}>{selectedTicket.from}</Text>
                    </View>
                    <Text style={styles.modalArrow}>➔</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.modalLabel}>TO</Text>
                      <Text style={styles.modalCity}>{selectedTicket.to}</Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.infoGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.modalLabel}>DATE</Text>
                      <Text style={styles.modalValue}>{selectedTicket.date}</Text>
                    </View>
                    <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
                      <Text style={styles.modalLabel}>DEPARTURE</Text>
                      <Text style={styles.modalValue}>{selectedTicket.departureTime}</Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.modalLabel}>SEATS</Text>
                      <Text style={styles.modalValue}>{selectedTicket.seats?.join(', ')}</Text>
                    </View>
                    <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
                      <Text style={styles.modalLabel}>CLASS</Text>
                      <Text style={styles.modalValue}>{selectedTicket.busClass || 'Executive'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalDivider} />

                  <Text style={styles.modalLabel}>PASSENGERS</Text>
                  {selectedTicket.passengers?.map((p: any, idx: number) => (
                    <Text key={idx} style={styles.passengerText}>
                      • {p.name} ({p.gender === 'M' ? 'Male' : 'Female'}) • ID: {p.passport}
                    </Text>
                  ))}

                  <View style={styles.modalDivider} />

                  {/* Simulated barcode */}
                  <View style={styles.barcodeSection}>
                    <Text style={styles.barcodeText}>||||| | |||| | || ||||| | ||| ||||</Text>
                    <Text style={styles.barcodeRef}>{selectedTicket.id}</Text>
                  </View>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setSelectedTicket(null)}
              >
                <Text style={styles.closeModalButtonText}>Close Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  refreshIcon: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: 'bold',
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
  noBookingsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noBookingsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  noBookingsDesc: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#292929',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#252525',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  ticketRef: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: '#1e3d23',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#32a846',
  },
  statusBadgeText: {
    color: '#32a846',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityCol: {
    flex: 1,
  },
  timeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  cityText: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
  },
  arrowIcon: {
    color: '#d4af37',
    fontSize: 16,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#282828',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  cardFooter: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
  },
  tapPrompt: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  ticketWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  ticketHeader: {
    backgroundColor: '#d4af37',
    padding: 20,
    alignItems: 'center',
  },
  ticketCompany: {
    fontSize: 18,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 1,
  },
  ticketType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#121212',
    marginTop: 4,
    letterSpacing: 2,
  },
  ticketInfoSection: {
    padding: 20,
  },
  modalRouteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalCity: {
    fontSize: 20,
    fontWeight: '900',
    color: '#121212',
    marginTop: 2,
  },
  modalArrow: {
    fontSize: 20,
    color: '#d4af37',
  },
  modalDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 1,
    marginVertical: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121212',
    marginTop: 2,
  },
  passengerText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
    marginTop: 4,
  },
  barcodeSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  barcodeText: {
    fontSize: 28,
    fontFamily: 'System',
    color: '#121212',
    letterSpacing: 2,
  },
  barcodeRef: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginTop: 4,
    letterSpacing: 1,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 15,
  },
  notificationBanner: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  notificationEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  notificationText: {
    fontSize: 10,
    color: '#15803d',
    marginTop: 2,
    lineHeight: 14,
    fontWeight: '500',
  },
});
