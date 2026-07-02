import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import SeatMapScreen from './src/screens/SeatMapScreen';
import PassengerScreen from './src/screens/PassengerScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SupportScreen from './src/screens/SupportScreen';

type ScreenName = 'Welcome' | 'Login' | 'Home' | 'Results' | 'SeatMap' | 'Passenger' | 'Payment' | 'Bookings' | 'Profile' | 'Support';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Welcome');
  const [userId, setUserId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');

  // Search Results State
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Selected schedule & passengers state
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);

  // Navigation History stack (simple push/pop mechanism)
  const [history, setHistory] = useState<ScreenName[]>([]);

  const navigateTo = (screen: ScreenName) => {
    setHistory([...history, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('Home');
    }
  };

  const handleSearch = (from: string, to: string, date: string) => {
    setSearchFrom(from);
    setSearchTo(to);
    setSearchDate(date);
    navigateTo('Results');
  };

  const handleSelectSchedule = (schedule: any) => {
    setSelectedSchedule(schedule);
    navigateTo('SeatMap');
  };

  const handleConfirmSeats = (seats: string[]) => {
    setSelectedSeats(seats);
    navigateTo('Passenger');
  };

  const handleConfirmPassengers = (passengerDetails: any[]) => {
    setPassengers(passengerDetails);
    navigateTo('Payment');
  };

  const handlePaymentSuccess = (bookingId: string) => {
    // Reset booking state
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setPassengers([]);
    // Direct user to Bookings history screen
    setCurrentScreen('Bookings');
    setHistory(['Home']);
  };

  const handleLogout = () => {
    setUserId(null);
    setCurrentScreen('Login');
    setHistory([]);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomeScreen onGetStarted={() => navigateTo('Login')} />;
      case 'Login':
        return (
          <LoginScreen
            onLoginSuccess={(id) => {
              setUserId(id);
              setCurrentScreen('Home');
            }}
            onContinueAsGuest={() => {
              setUserId(null);
              setCurrentScreen('Home');
            }}
          />
        );
      case 'Home':
        return (
          <HomeScreen
            onSearch={handleSearch}
            currency={currency}
            onNavigateToScreen={navigateTo}
          />
        );
      case 'Results':
        return (
          <ResultsScreen
            from={searchFrom}
            to={searchTo}
            date={searchDate}
            currency={currency}
            onSelectSchedule={handleSelectSchedule}
            onGoBack={goBack}
          />
        );
      case 'SeatMap':
        return (
          <SeatMapScreen
            schedule={selectedSchedule}
            travelDate={searchDate}
            currency={currency}
            onConfirmSeats={handleConfirmSeats}
            onGoBack={goBack}
          />
        );
      case 'Passenger':
        return (
          <PassengerScreen
            selectedSeats={selectedSeats}
            onConfirmPassengers={handleConfirmPassengers}
            onGoBack={goBack}
          />
        );
      case 'Payment':
        return (
          <PaymentScreen
            schedule={selectedSchedule}
            travelDate={searchDate}
            selectedSeats={selectedSeats}
            passengers={passengers}
            currency={currency}
            onPaymentSuccess={handlePaymentSuccess}
            onGoBack={goBack}
          />
        );
      case 'Bookings':
        return <BookingsScreen currency={currency} onGoBack={() => setCurrentScreen('Home')} />;
      case 'Profile':
        return (
          <ProfileScreen
            userId={userId}
            currency={currency}
            onCurrencyChange={setCurrency}
            onLogout={handleLogout}
            onGoBack={goBack}
          />
        );
      case 'Support':
        return <SupportScreen userId={userId} onGoBack={() => setCurrentScreen('Home')} />;
      default:
        return <HomeScreen onSearch={handleSearch} currency={currency} onNavigateToScreen={navigateTo} />;
    }
  };

  // Determine if we should show the bottom navigation tabs
  const showTabs = ['Home', 'Bookings', 'Support', 'Profile'].includes(currentScreen);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.screenContent}>
        {renderActiveScreen()}
      </View>

      {showTabs && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen('Home')}
          >
            <Text style={[styles.tabIcon, currentScreen === 'Home' && styles.tabActive]}>🔍</Text>
            <Text style={[styles.tabLabel, currentScreen === 'Home' && styles.tabActive]}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen('Bookings')}
          >
            <Text style={[styles.tabIcon, currentScreen === 'Bookings' && styles.tabActive]}>🎟️</Text>
            <Text style={[styles.tabLabel, currentScreen === 'Bookings' && styles.tabActive]}>Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen('Support')}
          >
            <Text style={[styles.tabIcon, currentScreen === 'Support' && styles.tabActive]}>🛠️</Text>
            <Text style={[styles.tabLabel, currentScreen === 'Support' && styles.tabActive]}>Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentScreen('Profile')}
          >
            <Text style={[styles.tabIcon, currentScreen === 'Profile' && styles.tabActive]}>⚙️</Text>
            <Text style={[styles.tabLabel, currentScreen === 'Profile' && styles.tabActive]}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  screenContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#292929',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabIcon: {
    fontSize: 18,
    color: '#666666',
  },
  tabLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '700',
    marginTop: 4,
  },
  tabActive: {
    color: '#d4af37',
  },
});
