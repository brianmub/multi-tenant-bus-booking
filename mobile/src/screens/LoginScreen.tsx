import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../utils/supabaseClient';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (userId: string | null) => void;
  onContinueAsGuest: () => void;
}

export default function LoginScreen({ onLoginSuccess, onContinueAsGuest }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Create profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: name,
                email: email,
                preferred_currency: 'USD',
                saved_passengers: [],
              },
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }
        
        Alert.alert('Success', 'Account created! Please sign in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        onLoginSuccess(data.user?.id || null);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'An error occurred during auth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>G</Text>
        </View>
        <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Sign up to manage bookings and track buses' : 'Sign in to access your digital bus tickets'}</Text>
      </View>

      <View style={styles.form}>
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="example@mail.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.guestButton} onPress={onContinueAsGuest}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d4af37',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#d4af37',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d4af37',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#d4af37',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#121212',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontWeight: '700',
    fontSize: 12,
  },
  guestButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#666',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
