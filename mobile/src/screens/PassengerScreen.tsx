import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const COUNTRIES = [
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BW', name: 'Botswana' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MW', name: 'Malawi' },
  { code: 'NA', name: 'Namibia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'SZ', name: 'Swaziland' },
  { code: 'AO', name: 'Angola' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' }
];

interface PassengerScreenProps {
  selectedSeats: string[];
  onConfirmPassengers: (passengers: any[]) => void;
  onGoBack: () => void;
}

export default function PassengerScreen({ selectedSeats, onConfirmPassengers, onGoBack }: PassengerScreenProps) {
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);

  // Initialize passenger list based on selected seats
  const [passengers, setPassengers] = useState<any[]>(
    selectedSeats.map((seat) => ({
      seat,
      name: '',
      passport: '',
      gender: 'M',
      nationality: 'ZW',
      nok_name: '',
      nok_phone: '',
    }))
  );

  const updatePassengerField = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleConfirm = () => {
    // Validate
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        Alert.alert('Incomplete Form', `Please enter the name for Passenger in Seat ${p.seat}`);
        return;
      }
      if (!p.passport.trim()) {
        Alert.alert('Incomplete Form', `Please enter the ID/Passport number for Passenger in Seat ${p.seat}`);
        return;
      }
      if (!p.nok_name.trim()) {
        Alert.alert('Incomplete Form', `Please enter Next of Kin Name for Passenger in Seat ${p.seat}`);
        return;
      }
      if (!p.nok_phone.trim()) {
        Alert.alert('Incomplete Form', `Please enter Next of Kin Contact Number for Passenger in Seat ${p.seat}`);
        return;
      }
    }
    onConfirmPassengers(passengers);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Passenger Details</Text>
          <Text style={styles.headerSubtitle}>{selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Forms List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {passengers.map((passenger, i) => (
          <View key={passenger.seat} style={styles.passengerCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Passenger {i + 1}</Text>
              <View style={styles.seatBadge}>
                <Text style={styles.seatBadgeText}>Seat {passenger.seat}</Text>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name (as in Passport/ID)</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#666"
                value={passenger.name}
                onChangeText={(val) => updatePassengerField(i, 'name', val)}
              />
            </View>

            {/* Passport Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Passport / ID Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Passport or National ID"
                placeholderTextColor="#666"
                value={passenger.passport}
                onChangeText={(val) => updatePassengerField(i, 'passport', val)}
              />
            </View>

            {/* Gender and Nationality side by side */}
            <View style={styles.row}>
              {/* Gender */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      passenger.gender === 'M' && styles.genderButtonSelected,
                    ]}
                    onPress={() => updatePassengerField(i, 'gender', 'M')}
                  >
                    <Text style={[
                      styles.genderText,
                      passenger.gender === 'M' && styles.genderTextSelected
                    ]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      passenger.gender === 'F' && styles.genderButtonSelected,
                    ]}
                    onPress={() => updatePassengerField(i, 'gender', 'F')}
                  >
                    <Text style={[
                      styles.genderText,
                      passenger.gender === 'F' && styles.genderTextSelected
                    ]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nationality */}
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Nationality</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setActiveDropdownIndex(activeDropdownIndex === i ? null : i)}
                >
                  <Text style={styles.selectorTextSelected}>
                    {COUNTRIES.find(c => c.code === passenger.nationality)?.name || passenger.nationality}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {activeDropdownIndex === i && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                    {COUNTRIES.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={styles.dropdownItem}
                        onPress={() => {
                          updatePassengerField(i, 'nationality', country.code);
                          setActiveDropdownIndex(null);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{country.name} ({country.code})</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Next of Kin Details */}
            <View style={styles.formDivider} />
            <Text style={styles.subLabel}>Next of Kin Details</Text>

            {/* Next of Kin Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Next of Kin Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Emergency Contact Name"
                placeholderTextColor="#666"
                value={passenger.nok_name}
                onChangeText={(val) => updatePassengerField(i, 'nok_name', val)}
              />
            </View>

            {/* Next of Kin Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Next of Kin Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+27 71 234 5678"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={passenger.nok_phone}
                onChangeText={(val) => updatePassengerField(i, 'nok_phone', val)}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmCTA} onPress={handleConfirm}>
          <Text style={styles.confirmCTAText}>Proceed to Payment</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  passengerCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#292929',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    paddingBottom: 10,
    marginBottom: 14,
  },
  cardHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  seatBadge: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#d4af37',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  seatBadgeText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '700',
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
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    height: 48,
  },
  genderButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#d4af37',
  },
  genderText: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '700',
  },
  genderTextSelected: {
    color: '#121212',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#292929',
  },
  confirmCTA: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmCTAText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
  selectorButton: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  selectorTextSelected: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownArrow: {
    color: '#d4af37',
    fontSize: 10,
  },
  dropdownList: {
    backgroundColor: '#181818',
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: 150,
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
  formDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d4af37',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
});
