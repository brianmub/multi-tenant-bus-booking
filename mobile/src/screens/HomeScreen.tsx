import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onSearch: (from: string, to: string, date: string) => void;
  currency: string;
  onNavigateToScreen: (screen: string) => void;
}

const STATIC_CITIES = [
  'Bulawayo', 'Esigodini', 'Gwanda',
  'Beitbridge', 'Musina', 'Pretoria', 'Midrand', 'Johannesburg'
];

export default function HomeScreen({ onSearch, currency, onNavigateToScreen }: HomeScreenProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cities, setCities] = useState(STATIC_CITIES);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDate(formatted);
    }
  };
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals for selection
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  useEffect(() => {
    async function loadSchedules() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('route_from, route_to, price_usd');

        if (error) throw error;

        if (data && data.length > 0) {
          // Extract unique cities
          const dbCities = data.flatMap((s) => [s.route_from, s.route_to]);
          const uniqueCities = Array.from(new Set([...STATIC_CITIES, ...dbCities]));
          setCities(uniqueCities);

          // Get popular routes
          const uniqueRoutes: any[] = [];
          const seen = new Set();
          for (const item of data) {
            const key = `${item.route_from}-${item.route_to}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRoutes.push({
                from: item.route_from,
                to: item.route_to,
                price: parseFloat(item.price_usd),
              });
            }
            if (uniqueRoutes.length >= 4) break;
          }
          setPopularRoutes(uniqueRoutes);
        }
      } catch (e: any) {
        console.warn('Failed to load routes from DB, using fallback static data:', e.message);
        // Fallback popular routes
        setPopularRoutes([
          { from: 'Bulawayo', to: 'Beitbridge', price: 15 },
          { from: 'Beitbridge', to: 'Johannesburg', price: 35 },
          { from: 'Pretoria', to: 'Johannesburg', price: 5 },
          { from: 'Midrand', to: 'Johannesburg', price: 3 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadSchedules();
  }, []);

  const handleSearchSubmit = () => {
    if (!from || !to) {
      Alert.alert('Selection Required', 'Please select both departure and destination cities');
      return;
    }
    if (from === to) {
      Alert.alert('Invalid Selection', 'Departure and destination cities cannot be the same');
      return;
    }
    onSearch(from, to, date);
  };

  const selectPopularRoute = (routeFrom: string, routeTo: string) => {
    setFrom(routeFrom);
    setTo(routeTo);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>G</Text>
          </View>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>Genesis Bus Co.</Text>
            <Text style={styles.brandTagline}>Safe and Reliable Journeys</Text>
          </View>
        </View>
      </View>

      {/* Main Search Panel */}
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Where to next?</Text>
        
        {/* Departure City Select */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>From</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowFromModal(!showFromModal)}
          >
            <Text style={from ? styles.selectorTextSelected : styles.selectorTextPlaceholder}>
              {from || 'Select Departure City'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {showFromModal && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {cities.map((city) => (
                <TouchableOpacity 
                  key={`from-${city}`} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFrom(city);
                    if (city === to) {
                      setTo('');
                    }
                    setShowFromModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Swap Button representation */}
        <View style={styles.swapRow}>
          <TouchableOpacity 
            style={styles.swapButton}
            onPress={() => {
              const temp = from;
              setFrom(to);
              setTo(temp);
            }}
          >
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Destination City Select */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>To</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowToModal(!showToModal)}
          >
            <Text style={to ? styles.selectorTextSelected : styles.selectorTextPlaceholder}>
              {to || 'Select Destination City'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {showToModal && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {cities.filter(city => city !== from).map((city) => (
                <TouchableOpacity 
                  key={`to-${city}`} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setTo(city);
                    setShowToModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Travel Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Travel Date</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectorTextSelected}>
              {date}
            </Text>
            <Text style={styles.dropdownArrow}>📅</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {/* Search CTA */}
        <TouchableOpacity style={styles.searchCTA} onPress={handleSearchSubmit}>
          <Text style={styles.searchCTAText}>Search Buses</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Routes */}
      <View style={styles.popularSection}>
        <Text style={styles.sectionTitle}>Popular Routes</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#d4af37" style={{ marginTop: 12 }} />
        ) : (
          popularRoutes.map((route, i) => (
            <TouchableOpacity 
              key={`pop-${i}`} 
              style={styles.routeCard}
              onPress={() => selectPopularRoute(route.from, route.to)}
            >
              <View style={styles.routeHeader}>
                <Text style={styles.routeIcon}>📍</Text>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.from} ➔ {route.to}</Text>
                  <Text style={styles.routeSub}>Genesis Express Service</Text>
                </View>
              </View>
              <Text style={styles.routePrice}>
                {currency === 'ZAR' ? `R ${(route.price * 18.5).toFixed(0)}` : `$ ${route.price}`}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '900',
    color: '#d4af37',
  },
  brandContainer: {
    marginLeft: 14,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  brandTagline: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: '500',
  },
  searchCard: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  selectorButton: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorTextPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  selectorTextSelected: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownArrow: {
    color: '#d4af37',
    fontSize: 10,
  },
  swapRow: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 3,
  },
  swapButton: {
    backgroundColor: '#d4af37',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e1e1e',
  },
  swapIcon: {
    color: '#121212',
    fontSize: 18,
    fontWeight: '900',
  },
  dropdownList: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: 180,
    overflow: 'scroll',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: '#121212',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  searchCTA: {
    backgroundColor: '#d4af37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchCTAText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
  popularSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
  },
  routeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#292929',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    fontSize: 18,
  },
  routeInfo: {
    marginLeft: 12,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  routeSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  routePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#d4af37',
  },
});
