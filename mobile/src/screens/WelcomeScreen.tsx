import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.glowCircle} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/tenants/genesis/icon.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Genesis Bus Company</Text>
        <Text style={styles.tagline}>Safe and Reliable Journeys</Text>
        
        <Text style={styles.description}>
          Experience premium bus travel across Zimbabwe and South Africa. Book seats, check schedules, and track your ride in real-time.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={onGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    top: '20%',
    left: '10%',
    blurRadius: 100, // Concept representation
  },
  content: {
    width: '90%',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    borderColor: '#d4af37',
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4af37',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  button: {
    width: width * 0.8,
    backgroundColor: '#d4af37',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
  },
});
