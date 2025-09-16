import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, Switch, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [testMode, setTestMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* App Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>App Information</Title>
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>App Name:</Paragraph>
              <Paragraph style={styles.infoValue}>Interswitch SDK Demo</Paragraph>
            </View>
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Version:</Paragraph>
              <Paragraph style={styles.infoValue}>1.0.0</Paragraph>
            </View>
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>SDK Version:</Paragraph>
              <Paragraph style={styles.infoValue}>1.1.0</Paragraph>
            </View>
            <View style={styles.infoRow}>
              <Paragraph style={styles.infoLabel}>Environment:</Paragraph>
              <Paragraph style={[styles.infoValue, styles.sandboxText]}>
                {testMode ? 'Sandbox' : 'Production'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Settings</Title>
            
            <List.Item
              title="Test Mode"
              description="Enable sandbox environment for testing"
              left={(props) => <List.Icon {...props} icon="flask" color="#f39c12" />}
              right={() => (
                <Switch
                  value={testMode}
                  onValueChange={setTestMode}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Push Notifications"
              description="Get notified about transaction updates"
              left={(props) => <List.Icon {...props} icon="bell" color="#3498db" />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Auto Backup"
              description="Automatically backup transaction data"
              left={(props) => <List.Icon {...props} icon="cloud-upload" color="#2ecc71" />}
              right={() => (
                <Switch
                  value={autoBackup}
                  onValueChange={setAutoBackup}
                />
              )}
            />
            
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Actions</Title>
            
            <List.Item
              title="Clear Transaction History"
              description="Remove all stored transaction data"
              left={(props) => <List.Icon {...props} icon="delete" color="#e74c3c" />}
              onPress={() => {
                // Handle clear history
                console.log('Clear transaction history');
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Export Data"
              description="Export transaction data to CSV"
              left={(props) => <List.Icon {...props} icon="download" color="#3498db" />}
              onPress={() => {
                // Handle export data
                console.log('Export data');
              }}
            />
            
            <Divider />
            
            <List.Item
              title="View Logs"
              description="View application logs and debug info"
              left={(props) => <List.Icon {...props} icon="text-box" color="#95a5a6" />}
              onPress={() => {
                // Handle view logs
                console.log('View logs');
              }}
            />
            
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.supportCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Support</Title>
            
            <List.Item
              title="Documentation"
              description="View Interswitch SDK documentation"
              left={(props) => <List.Icon {...props} icon="book-open" color="#9b59b6" />}
              onPress={() => {
                // Open documentation
                console.log('Open documentation');
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Contact Support"
              description="Get help from Interswitch support team"
              left={(props) => <List.Icon {...props} icon="help-circle" color="#e67e22" />}
              onPress={() => {
                // Contact support
                console.log('Contact support');
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Report Bug"
              description="Report issues or bugs in the app"
              left={(props) => <List.Icon {...props} icon="bug" color="#e74c3c" />}
              onPress={() => {
                // Report bug
                console.log('Report bug');
              }}
            />
            
          </Card.Content>
        </Card>

        {/* Developer Info */}
        <Card style={styles.developerCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Developer</Title>
            <Paragraph style={styles.developerText}>
              Built by Chimobi Ogudu{'\n'}
              Phone: 09031123536{'\n'}
              Location: No 7 Prince Ebenzer Street, Lagos
            </Paragraph>
            <Button 
              mode="outlined" 
              style={styles.contactButton}
              onPress={() => {
                // Contact developer
                console.log('Contact developer');
              }}
            >
              Contact Developer
            </Button>
          </Card.Content>
        </Card>

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
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  supportCard: {
    marginBottom: 16,
    elevation: 2,
  },
  developerCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#e8f5e8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sandboxText: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
  developerText: {
    fontSize: 14,
    color: '#27ae60',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    borderColor: '#27ae60',
  },
});