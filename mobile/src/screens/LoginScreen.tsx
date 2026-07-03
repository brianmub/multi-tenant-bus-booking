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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleForgotPasswordSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      Alert.alert('Success', 'Password reset instructions sent to your email.');
      setIsForgotPassword(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const rules = [
    { id: 'len', label: 'At least 8 characters', test: password.length >= 8 },
    { id: 'upper', label: 'At least one uppercase letter (A-Z)', test: /[A-Z]/.test(password) },
    { id: 'lower', label: 'At least one lowercase letter (a-z)', test: /[a-z]/.test(password) },
    { id: 'num', label: 'At least one number (0-9)', test: /[0-9]/.test(password) },
    { id: 'special', label: 'At least one special char (e.g. !@#$)', test: /[^A-Za-z0-9]/.test(password) }
  ];

  const strengthScore = rules.filter(r => r.test).length;
  const isPasswordValid = strengthScore === rules.length;

  const getStrengthText = () => {
    if (!password) return '';
    switch (strengthScore) {
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!confirmPassword) {
        Alert.alert('Error', 'Please confirm your password');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (!isPasswordValid) {
        Alert.alert('Error', 'Please ensure your password meets all strength requirements');
        return;
      }
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

  let screenTitle = isSignUp ? 'Create Account' : 'Welcome Back';
  let screenSubtitle = isSignUp 
    ? 'Sign up to manage bookings and track buses' 
    : 'Sign in to access your digital bus tickets';

  if (isForgotPassword) {
    screenTitle = 'Recover Account';
    screenSubtitle = 'Enter your email to receive password reset instructions';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>G</Text>
        </View>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.subtitle}>{screenSubtitle}</Text>
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

        {!isForgotPassword && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isSignUp && password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarContainer}>
              {[1, 2, 3, 4, 5].map((level) => {
                let color = '#333333';
                if (strengthScore >= level) {
                  if (strengthScore <= 2) color = '#ef4444';
                  else if (strengthScore === 3) color = '#f97316';
                  else if (strengthScore === 4) color = '#eab308';
                  else color = '#22c55e';
                }
                return (
                  <View
                    key={level}
                    style={[styles.strengthSegment, { backgroundColor: color }]}
                  />
                );
              })}
            </View>
            
            <View style={styles.strengthTextRow}>
              <Text style={styles.strengthLabel}>Password Strength:</Text>
              <Text style={[
                styles.strengthValue,
                { color: strengthScore <= 2 ? '#ef4444' : strengthScore === 3 ? '#f97316' : strengthScore === 4 ? '#eab308' : '#22c55e' }
              ]}>
                {getStrengthText()}
              </Text>
            </View>

            <View style={styles.rulesContainer}>
              {rules.map((rule) => (
                <View key={rule.id} style={styles.ruleRow}>
                  <Text style={[
                    styles.ruleBullet,
                    { color: rule.test ? '#22c55e' : '#666666' }
                  ]}>
                    {rule.test ? '✓' : '•'}
                  </Text>
                  <Text style={[
                    styles.ruleText,
                    { color: rule.test ? '#ffffff' : '#888888' }
                  ]}>
                    {rule.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && (
              <Text style={[
                styles.matchText,
                { color: password === confirmPassword ? '#22c55e' : '#ef4444' }
              ]}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}
          </View>
        )}

        {!isSignUp && !isForgotPassword && (
          <TouchableOpacity 
            style={styles.forgotButton} 
            onPress={() => setIsForgotPassword(true)}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={isForgotPassword ? handleForgotPasswordSubmit : handleAuth} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Text style={styles.buttonText}>
              {isForgotPassword ? 'Send Instructions' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {isForgotPassword ? (
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => {
              setIsForgotPassword(false);
            }}
          >
            <Text style={styles.switchText}>Back to Sign In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => {
              setIsSignUp(!isSignUp);
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
            }}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        )}

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
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButtonText: {
    fontSize: 18,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  strengthContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    height: 6,
    gap: 4,
    marginBottom: 8,
  },
  strengthSegment: {
    flex: 1,
    borderRadius: 3,
  },
  strengthTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  rulesContainer: {
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleBullet: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ruleText: {
    fontSize: 12,
  },
  buttonDisabled: {
    backgroundColor: '#4a4a4a',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonTextDisabled: {
    color: '#bbb',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
  },
  forgotText: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
