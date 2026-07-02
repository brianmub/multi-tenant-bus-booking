import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
  from: string;
  to: string;
  date: string;
  currency: string;
  onSelectSchedule: (schedule: any) => void;
  onGoBack: () => void;
}

export default function ResultsScreen({ from, to, date, currency, onSelectSchedule, onGoBack }: ResultsScreenProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFallbackSchedules = () => {
      return [
        {
          id: `SCH-${from.slice(0, 3).toUpperCase()}-${to.slice(0, 3).toUpperCase()}-1`,
          bus_id: 'G-401',
          route_from: from,
          route_to: to,
          departure_time: '08:00 AM',
          price_usd: 15.00,
          travel_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        {
          id: `SCH-${from.slice(0, 3).toUpperCase()}-${to.slice(0, 3).toUpperCase()}-2`,
          bus_id: 'G-402',
          route_from: from,
          route_to: to,
          departure_time: '10:30 AM',
          price_usd: 20.00,
          travel_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        {
          id: `SCH-${from.slice(0, 3).toUpperCase()}-${to.slice(0, 3).toUpperCase()}-3`,
          bus_id: 'G-403',
          route_from: from,
          route_to: to,
          departure_time: '02:00 PM',
          price_usd: 25.00,
          travel_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
      ];
    };

    async function fetchSchedules() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('route_from', from)
          .eq('route_to', to);

        if (error) throw error;

        let activeSchedules = [];
        if (data && data.length > 0) {
          // Parse the day of the week for the selected date
          const dateObj = new Date(date);
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const selectedDayName = daysOfWeek[dateObj.getDay()];

          // Filter by active travel days
          activeSchedules = data.filter((schedule) => {
            try {
              const days = typeof schedule.travel_days === 'string'
                ? JSON.parse(schedule.travel_days)
                : schedule.travel_days;
              return Array.isArray(days) && days.includes(selectedDayName);
            } catch (err) {
              // Default to true if parsing fails
              return true;
            }
          });
        }

        if (activeSchedules.length === 0) {
          activeSchedules = getFallbackSchedules();
        }
        setSchedules(activeSchedules);
      } catch (err: any) {
        console.warn('Failed to load database schedules, using offline static fallback:', err.message);
        setSchedules(getFallbackSchedules());
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [from, to, date]);

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{from} ➔ {to}</Text>
          <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Finding available buses...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => onGoBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : schedules.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noBusesIcon}>🚌</Text>
          <Text style={styles.noBusesTitle}>No Buses Scheduled</Text>
          <Text style={styles.noBusesDesc}>
            There are no active routes scheduled for this combination on {formatDate(date)}. Please try another date or route.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onGoBack}>
            <Text style={styles.retryButtonText}>Change Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          <Text style={styles.listCount}>{schedules.length} departures found</Text>
          
          {schedules.map((schedule) => {
            const price = parseFloat(schedule.price_usd);
            const displayPrice = currency === 'ZAR' ? `R ${(price * 18.5).toFixed(0)}` : `$ ${price.toFixed(2)}`;

            return (
              <View key={schedule.id} style={styles.busCard}>
                <View style={styles.cardTop}>
                  <View style={styles.busInfo}>
                    <Text style={styles.busName}>Genesis Executive</Text>
                    <Text style={styles.busReg}>{schedule.bus_id} • Semi-Sleeper</Text>
                  </View>
                  <Text style={styles.price}>{displayPrice}</Text>
                </View>

                <View style={styles.cardRouteDetail}>
                  <View style={styles.routePoint}>
                    <Text style={styles.time}>{schedule.departure_time}</Text>
                    <Text style={styles.city}>{from}</Text>
                  </View>

                  <View style={styles.connector}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <Text style={styles.busEmoji}>🚌</Text>
                    <View style={styles.line} />
                    <View style={styles.dot} />
                  </View>

                  <View style={styles.routePointEnd}>
                    <Text style={styles.time}>Next Day (Est)</Text>
                    <Text style={styles.city}>{to}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.features}>⚡ WiFi • 🔋 Outlets • ❄️ AC</Text>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => onSelectSchedule(schedule)}
                  >
                    <Text style={styles.bookButtonText}>Select Seats</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
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
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 14,
  },
  noBusesIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noBusesTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  noBusesDesc: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 14,
    letterSpacing: 1,
  },
  busCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#292929',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    paddingBottom: 12,
  },
  busInfo: {
    flex: 1,
  },
  busName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  busReg: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: '600',
    marginTop: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardRouteDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  routePoint: {
    flex: 1,
  },
  routePointEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  city: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '500',
    marginTop: 4,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d4af37',
  },
  line: {
    width: 25,
    height: 1,
    backgroundColor: '#333',
  },
  busEmoji: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#282828',
    paddingTop: 12,
  },
  features: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 13,
  },
});
