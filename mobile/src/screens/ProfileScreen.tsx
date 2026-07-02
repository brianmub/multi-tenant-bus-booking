import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  userId: string | null;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onLogout: () => void;
  onGoBack: () => void;
}

export default function ProfileScreen({
  userId,
  currency,
  onCurrencyChange,
  onLogout,
  onGoBack,
}: ProfileScreenProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        console.warn('Failed to load profile from database:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onLogout();
      Alert.alert('Signed Out', 'You have been successfully signed out.');
    } catch (err: any) {
      Alert.alert('Sign Out Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {loading ? (
              <ActivityIndicator size="small" color="#d4af37" />
            ) : userId ? (
              <>
                <Text style={styles.profileName}>{profile?.name || 'Member'}</Text>
                <Text style={styles.profileEmail}>{profile?.email || 'Authenticated User'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>Guest User</Text>
                <Text style={styles.profileEmail}>Sign in to save bookings online</Text>
              </>
            )}
          </View>
        </View>

        {/* Currency Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.prefRow}>
            <View>
              <Text style={styles.prefLabel}>Preferred Currency</Text>
              <Text style={styles.prefDesc}>Convert fares dynamically in search results</Text>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, currency === 'USD' && styles.toggleButtonActive]}
                onPress={() => onCurrencyChange('USD')}
              >
                <Text style={[styles.toggleText, currency === 'USD' && styles.toggleTextActive]}>USD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, currency === 'ZAR' && styles.toggleButtonActive]}
                onPress={() => onCurrencyChange('ZAR')}
              >
                <Text style={[styles.toggleText, currency === 'ZAR' && styles.toggleTextActive]}>ZAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Support Link Shortcut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          {userId ? (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginCTA} onPress={onLogout}>
              <Text style={styles.loginCTAText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#292929',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d4af37',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: '#d4af37',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#292929',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  prefDesc: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    width: width * 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#d4af37',
  },
  toggleText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '800',
  },
  toggleTextActive: {
    color: '#121212',
  },
  signOutButton: {
    backgroundColor: '#3d1616',
    borderWidth: 1,
    borderColor: '#a83232',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#ff4d4d',
    fontWeight: '800',
    fontSize: 14,
  },
  loginCTA: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginCTAText: {
    color: '#121212',
    fontWeight: '800',
    fontSize: 14,
  },
});
