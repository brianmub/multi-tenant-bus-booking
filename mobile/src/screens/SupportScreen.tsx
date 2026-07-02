import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabaseClient';

interface SupportScreenProps {
  userId: string | null;
  onGoBack: () => void;
}

const ISSUE_CATEGORIES = [
  'Booking Issue',
  'Payment Dispute',
  'Bus Delay/Schedule',
  'Refund Request',
  'Luggage Query',
  'Other Support'
];

export default function SupportScreen({ userId, onGoBack }: SupportScreenProps) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSubmit = async () => {
    if (!issueType) {
      Alert.alert('Required Info', 'Please select an issue category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required Info', 'Please enter a description of your issue');
      return;
    }

    setLoading(true);
    try {
      // Insert support ticket into database
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: userId || null,
            issue_type: issueType,
            description: description.trim(),
            status: 'OPEN'
          }
        ]);

      if (error) throw error;

      Alert.alert(
        'Ticket Submitted!',
        'Our customer support team is reviewing your ticket and will contact you shortly.',
        [{ text: 'OK', onPress: onGoBack }]
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeTitle}>How can we help?</Text>
        <Text style={styles.welcomeDesc}>
          Submit a ticket, and our Genesis Bus Support desk will investigate and follow up with you.
        </Text>

        {/* Issue Type Category Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Issue Category</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={issueType ? styles.selectorTextSelected : styles.selectorTextPlaceholder}>
              {issueType || 'Choose Category'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.dropdownList}>
              {ISSUE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIssueType(category);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Detailed Description</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Please write details about your concern, including booking ID if applicable..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  selectorButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
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
  dropdownList: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
  },
  textarea: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    height: 140,
  },
  submitButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '800',
  },
});
