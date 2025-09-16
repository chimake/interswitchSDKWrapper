import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, List, Paragraph, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const features = [
    {
      title: 'Card Payments',
      description: 'Accept Visa, Mastercard, and Verve cards',
      icon: '💳'
    },
    {
      title: 'Bank Transfer',
      description: 'Direct bank account transfers',
      icon: '🏦'
    },
    {
      title: 'USSD Payments',
      description: 'Mobile money via USSD codes',
      icon: '📱'
    },
    {
      title: 'QR Payments',
      description: 'Quick scan-to-pay functionality',
      icon: '🔲'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>Interswitch SDK Demo</Title>
            <Paragraph style={styles.welcomeText}>
              Complete payment solution for your mobile application. 
              Test all payment methods in sandbox mode.
            </Paragraph>
            <Chip mode="outlined" style={styles.testModeChip} textStyle={styles.chipText}>
              🧪 Test Mode Active
            </Chip>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Title style={styles.statNumber}>₦0.00</Title>
              <Paragraph style={styles.statLabel}>Total Processed</Paragraph>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Title style={styles.statNumber}>0</Title>
              <Paragraph style={styles.statLabel}>Transactions</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Features Section */}
        <Title style={styles.sectionTitle}>Supported Payment Methods</Title>
        {features.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <List.Item
              title={feature.title}
              description={feature.description}
              left={() => (
                <View style={styles.iconContainer}>
                  <Paragraph style={styles.featureIcon}>{feature.icon}</Paragraph>
                </View>
              )}
            />
          </Card>
        ))}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Link href="/payment" asChild>
            <Button
              mode="contained"
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              icon="credit-card"
            >
              Make Test Payment
            </Button>
          </Link>
          
          <Link href="/history" asChild>
            <Button
              mode="outlined"
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
              icon="history"
            >
              View Transaction History
            </Button>
          </Link>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContainer: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 20,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 22,
  },
  testModeChip: {
    alignSelf: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 8,
    elevation: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  featureIcon: {
    fontSize: 24,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    borderColor: '#3498db',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});