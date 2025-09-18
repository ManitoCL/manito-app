/**
 * TestScreen - Simple test component to debug rendering issues
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Text Test */}
        <View style={styles.section}>
          <Text style={styles.title}>Test Component</Text>
          <Text style={styles.subtitle}>This is a simple test to check if text renders</Text>
        </View>

        {/* Basic Styling Test */}
        <View style={styles.colorSection}>
          <Text style={styles.whiteText}>White text on blue background</Text>
        </View>

        {/* Card Test */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card Title</Text>
          <Text style={styles.cardContent}>This is card content text</Text>
        </View>

        {/* Font Size Test */}
        <View style={styles.section}>
          <Text style={styles.small}>Small text (12px)</Text>
          <Text style={styles.medium}>Medium text (16px)</Text>
          <Text style={styles.large}>Large text (24px)</Text>
        </View>

        {/* Color Test */}
        <View style={styles.section}>
          <Text style={styles.redText}>Red text</Text>
          <Text style={styles.blueText}>Blue text</Text>
          <Text style={styles.greenText}>Green text</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  colorSection: {
    backgroundColor: '#052A4A',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#F7FAFC',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#052A4A',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 5,
  },
  medium: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  large: {
    fontSize: 24,
    color: '#000000',
    marginBottom: 5,
  },
  redText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 5,
  },
  blueText: {
    fontSize: 16,
    color: '#2B8ED6',
    marginBottom: 5,
  },
  greenText: {
    fontSize: 16,
    color: '#16A34A',
    marginBottom: 5,
  },
});

export default TestScreen;