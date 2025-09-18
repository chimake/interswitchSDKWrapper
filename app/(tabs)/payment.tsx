import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, TextInput, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import InterswitchPOSService, { PaymentResult } from '../../src/services/InterswitchService';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  amount: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function PaymentScreen() {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerMobile: '',
    amount: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);

  useEffect(() => {
    initializeTerminal();
    setupEventListeners();

    return () => {
      InterswitchPOSService.removeEventListeners();
    };
  }, []);

  const initializeTerminal = async () => {
    try {
      const result = await InterswitchPOSService.initializeTerminal({
        environment: 'TEST', // Use TEST for development
        appVersion: '1.0.0'
      });

      if (result.success) {
        setTerminalReady(true);
        Toast.show({
          type: 'success',
          text1: 'Terminal Ready',
          text2: 'POS terminal initialized successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Terminal Error',
          text2: result.error || 'Failed to initialize terminal',
        });
      }
    } catch (error) {
      console.error('Terminal initialization error:', error);
    }
  };

  const setupEventListeners = () => {
    InterswitchPOSService.addEventListeners({
      onPaymentCompleted: (result: PaymentResult) => {
        console.log('Payment completed:', result);
        if (result.isSuccessful) {
          Toast.show({
            type: 'success',
            text1: 'Payment Successful! 🎉',
            text2: `Amount: ₦${result.amount} - RRN: ${result.rrn}`,
            visibilityTime: 6000,
          });
          
          // Print receipt
          printReceipt(result);
          
          // Reset form
          setFormData({
            customerName: '',
            customerEmail: '',
            customerMobile: '',
            amount: ''
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: result.responseMessage || 'Transaction declined',
            visibilityTime: 4000,
          });
        }
        setLoading(false);
      },
      onPaymentCancelled: (result) => {
        console.log('Payment cancelled:', result);
        Toast.show({
          type: 'info',
          text1: 'Payment Cancelled',
          text2: 'Transaction was cancelled by user',
        });
        setLoading(false);
      },
      onPrintCompleted: (result) => {
        console.log('Print completed:', result);
        Toast.show({
          type: 'success',
          text1: 'Receipt Printed',
          text2: 'Transaction receipt printed successfully',
        });
      },
      onPrintError: (result) => {
        console.log('Print error:', result);
        Toast.show({
          type: 'error',
          text1: 'Print Error',
          text2: result.message || 'Failed to print receipt',
        });
      }
    });
  };

  const printReceipt = async (transactionData: PaymentResult) => {
    try {
      const receiptData = InterswitchPOSService.createStandardReceipt(
        transactionData,
        {
          name: 'Your Business Name',
          address: '123 Business Street, Lagos',
          phone: '+234 123 456 7890'
        }
      );

      await InterswitchPOSService.printReceipt(receiptData);
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Enter a valid email address';
    }

    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.customerMobile.replace(/\D/g, ''))) {
      newErrors.customerMobile = 'Enter a valid phone number (10-11 digits)';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountValidation = InterswitchPOSService.validatePaymentAmount(Number(formData.amount));
      if (!amountValidation.valid) {
        newErrors.amount = amountValidation.error!;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    if (!terminalReady) {
      Toast.show({
        type: 'error',
        text1: 'Terminal Not Ready',
        text2: 'Please wait for terminal initialization',
      });
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        amount: Number(formData.amount),
        paymentType: 'Card' as const, // Default to Card payment
        reference: await InterswitchPOSService.generateTransactionReference(),
        remark: `Payment for ${formData.customerName}`
      };

      console.log('Initiating payment:', paymentData);
      
      // The actual payment result will be handled by the event listeners
      const result = await InterswitchPOSService.makePayment(paymentData);
      
      if (!result.success) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Payment Error',
          text2: result.error || 'Failed to initiate payment',
        });
      }
      // If successful, the loading state will be handled by onPaymentCompleted callback
      
    } catch (error: any) {
      setLoading(false);
      console.error('Payment error:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: error.message || 'An unexpected error occurred',
      });
    }
  };

  const fillTestData = () => {
    setFormData({
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerMobile: '08123456789',
      amount: '500'
    });
  };

  const showSettings = async () => {
    try {
      await InterswitchPOSService.showSettings();
    } catch (error) {
      console.error('Settings error:', error);
    }
  };

  const callHome = async () => {
    try {
      const result = await InterswitchPOSService.callHome();
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Sync Complete',
          text2: 'Terminal synced with server',
        });
      }
    } catch (error) {
      console.error('Call home error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Interswitch Payment</Title>
            <View style={styles.statusContainer}>
              <Chip 
                mode="outlined" 
                textStyle={[styles.statusText, terminalReady ? styles.readyText : styles.notReadyText]}
                style={terminalReady ? styles.readyChip : styles.notReadyChip}
              >
                {terminalReady ? '✅ Terminal Ready' : '⏳ Initializing...'}
              </Chip>
              <Button 
                mode="text" 
                onPress={fillTestData}
                style={styles.fillTestButton}
                labelStyle={styles.fillTestLabel}
              >
                Fill Test Data
              </Button>
            </View>
            <View style={styles.actionButtons}>
              <Button mode="outlined" onPress={showSettings} style={styles.actionButton}>
                Settings
              </Button>
              <Button mode="outlined" onPress={callHome} style={styles.actionButton}>
                Sync
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.formCard}>
          <Card.Content>
            
            <TextInput
              label="Customer Name *"
              value={formData.customerName}
              onChangeText={(value) => handleInputChange('customerName', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.customerName}
              disabled={loading}
              left={<TextInput.Icon icon="account" />}
            />
            <HelperText type="error" visible={!!errors.customerName}>
              {errors.customerName}
            </HelperText>

            <TextInput
              label="Email Address *"
              value={formData.customerEmail}
              onChangeText={(value) => handleInputChange('customerEmail', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.customerEmail}
              disabled={loading}
              left={<TextInput.Icon icon="email" />}
            />
            <HelperText type="error" visible={!!errors.customerEmail}>
              {errors.customerEmail}
            </HelperText>

            <TextInput
              label="Phone Number *"
              value={formData.customerMobile}
              onChangeText={(value) => handleInputChange('customerMobile', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.customerMobile}
              disabled={loading}
              left={<TextInput.Icon icon="phone" />}
            />
            <HelperText type="error" visible={!!errors.customerMobile}>
              {errors.customerMobile}
            </HelperText>

            <TextInput
              label="Amount (₦) *"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              mode="outlined"
              style={styles.input}
              keyboardType="decimal-pad"
              error={!!errors.amount}
              disabled={loading}
              left={<TextInput.Icon icon="currency-ngn" />}
            />
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>

            <Button
              mode="contained"
              onPress={handlePayment}
              loading={loading}
              disabled={loading || !terminalReady}
              style={[styles.payButton, !terminalReady && styles.disabledButton]}
              contentStyle={styles.payButtonContent}
              icon="credit-card"
            >
              {loading ? 'Processing Payment...' : 'Pay with POS Terminal'}
            </Button>

          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>SmartPOS Features</Title>
            <HelperText>
              • Card payments (Chip & PIN, Contactless){'\n'}
              • Multiple payment methods (Card, QR, USSD){'\n'}
              • Automatic receipt printing{'\n'}
              • Real-time transaction processing{'\n'}
              • Secure PAX terminal integration
            </HelperText>
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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readyText: {
    color: '#27ae60',
  },
  notReadyText: {
    color: '#e67e22',
  },
  readyChip: {
    backgroundColor: '#d5f4e6',
  },
  notReadyChip: {
    backgroundColor: '#ffeaa7',
  },
  fillTestButton: {
    marginLeft: 8,
  },
  fillTestLabel: {
    fontSize: 12,
    color: '#3498db',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  formCard: {
    marginBottom: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 4,
  },
  payButton: {
    backgroundColor: '#27ae60',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    backgroundColor: '#e8f5e8',
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 8,
  },
});