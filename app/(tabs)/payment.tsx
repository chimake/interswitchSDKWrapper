import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, HelperText, Snackbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    } else if (Number(formData.amount) < 10) {
      newErrors.amount = 'Minimum amount is ₦10';
    } else if (Number(formData.amount) > 1000000) {
      newErrors.amount = 'Maximum amount is ₦1,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTransactionReference = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `TXN_${timestamp}_${randomNum}`;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transactionRef = generateTransactionReference();
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Payment Successful! 🎉',
        text2: `Transaction: ${transactionRef}`,
        visibilityTime: 4000,
      });
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerMobile: '',
        amount: ''
      });
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: 'Please try again',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Make Payment</Title>
            <View style={styles.testModeContainer}>
              <Chip mode="outlined" textStyle={styles.testModeText}>
                🧪 Test Mode - No real charges
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
              left={<TextInput.Icon icon="currency-ngn" />}
            />
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>

            <Button
              mode="contained"
              onPress={handlePayment}
              loading={loading}
              disabled={loading}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
              icon="credit-card"
            >
              {loading ? 'Processing Payment...' : 'Pay Now'}
            </Button>

          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Test Payment Methods</Title>
            <HelperText>
              • Card payments with test card numbers{'\n'}
              • Bank transfer simulation{'\n'}
              • USSD code testing{'\n'}
              • QR code payments
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
  testModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fillTestButton: {
    marginLeft: 8,
  },
  fillTestLabel: {
    fontSize: 12,
    color: '#3498db',
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