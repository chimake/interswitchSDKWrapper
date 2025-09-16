import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, List, Paragraph, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: 'successful' | 'failed' | 'pending';
  customerName: string;
  customerEmail: string;
  channel: string;
  date: string;
}

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      reference: 'TXN_1703875200_123456',
      amount: 50000, // in kobo
      status: 'successful',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      channel: 'CARD',
      date: '2024-12-29T10:30:00Z'
    },
    {
      id: '2',
      reference: 'TXN_1703788800_789012',
      amount: 25000,
      status: 'failed',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      channel: 'BANK_TRANSFER',
      date: '2024-12-28T15:45:00Z'
    },
    {
      id: '3',
      reference: 'TXN_1703702400_345678',
      amount: 100000,
      status: 'pending',
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@example.com',
      channel: 'USSD',
      date: '2024-12-27T09:15:00Z'
    }
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    // Simulate loading delay
    setTimeout(() => {
      setTransactions(mockTransactions);
    }, 500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadTransactions();
      setRefreshing(false);
    }, 1000);
  };

  const formatAmount = (amountInKobo: number): string => {
    return (amountInKobo / 100).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN'
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'successful':
        return '#27ae60';
      case 'failed':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getChannelDisplayName = (channel: string): string => {
    switch (channel) {
      case 'CARD':
        return 'Card Payment';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'USSD':
        return 'USSD';
      case 'QR':
        return 'QR Code';
      default:
        return channel;
    }
  };

  const getChannelIcon = (channel: string): string => {
    switch (channel) {
      case 'CARD':
        return 'credit-card';
      case 'BANK_TRANSFER':
        return 'bank';
      case 'USSD':
        return 'phone';
      case 'QR':
        return 'qrcode';
      default:
        return 'payment';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Transaction History</Title>
            <Paragraph style={styles.headerSubtitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Paragraph>
          </Card.Content>
        </Card>
        
        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyTitle}>No Transactions Yet</Title>
              <Paragraph style={styles.emptyText}>
                Your transaction history will appear here once you make payments.
              </Paragraph>
              <Button 
                mode="outlined" 
                style={styles.emptyButton}
                onPress={() => {/* Navigate to payment */}}
              >
                Make Your First Payment
              </Button>
            </Card.Content>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <Card.Content>
                
                <View style={styles.transactionHeader}>
                  <Paragraph style={styles.referenceText}>
                    {transaction.reference}
                  </Paragraph>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(transaction.status) }
                    ]}
                    textStyle={styles.statusText}
                  >
                    {transaction.status.toUpperCase()}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <List.Item
                  title={transaction.customerName}
                  description={transaction.customerEmail}
                  left={(props) => (
                    <List.Icon 
                      {...props} 
                      icon={getChannelIcon(transaction.channel)} 
                      color="#3498db"
                    />
                  )}
                  right={() => (
                    <View style={styles.amountContainer}>
                      <Paragraph style={styles.amountText}>
                        {formatAmount(transaction.amount)}
                      </Paragraph>
                      <Paragraph style={styles.channelText}>
                        {getChannelDisplayName(transaction.channel)}
                      </Paragraph>
                    </View>
                  )}
                />

                <Paragraph style={styles.dateText}>
                  {formatDate(transaction.date)}
                </Paragraph>

              </Card.Content>
            </Card>
          ))
        )}

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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 4,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  divider: {
    marginVertical: 8,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  channelText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 40,
    elevation: 2,
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginBottom: 16,
  },
  emptyButton: {
    alignSelf: 'center',
  },
});