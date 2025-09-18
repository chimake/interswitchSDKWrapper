import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';

// Enhanced interfaces to match the native module exactly
interface TerminalConfig {
  alias?: string;
  clientId?: string;
  clientSecret?: string;
  merchantCode?: string;
  merchantTelephone?: string;
  environment: 'TEST' | 'PRODUCTION';
  appVersion?: string;
}

interface LogoConfig {
  type: 'resource' | 'base64';
  resourceName?: string;
  base64Data?: string;
}

interface PaymentData {
  amount: number; // Amount in Naira (will be converted to kobo internally)
  paymentType?: 'Card' | 'QR' | 'USSD' | 'Transfer' | 'CNP' | 'ThankYouCash' | 'PayCode' | 'Cash';
  reference?: string;
  remark?: string;
}

interface PaymentResult {
  responseCode: string;
  responseMessage: string;
  isSuccessful: boolean;
  transactionReference: string;
  rrn: string;
  amount: number; // Amount in Naira
  cardType: string;
  transactionType: string;
  cardHolderName: string;
  cardExpiry: string;
  cardPan: string;
  aid: string;
  dateTime: string;
  txnDate: number;
  authorizationCode: string;
  stan: string;
  authCode: string;
  transactionCurrencyType: string;
  timestamp: number;
  status: 'completed' | 'cancelled';
}

interface PrintItem {
  type: 'text' | 'newline' | 'image' | 'separator';
  text?: string;
  isTitle?: boolean;
  isBold?: boolean;
  displayCenter?: boolean;
  imageType?: 'resource' | 'base64';
  resourceName?: string;
  base64Data?: string;
}

interface PrintResult {
  status: string;
  message: string;
  success: boolean;
  timestamp: number;
}

interface TerminalInfo {
  isInitialized: boolean;
  serialNumber: string;
  deviceType: string;
  sdkVersion: string;
}

interface SuccessResult {
  success: boolean;
  message: string;
  timestamp: number;
}

// Get the native module
const { InterswitchPosModule } = NativeModules;

if (!InterswitchPosModule) {
  throw new Error('InterswitchPosModule is not properly linked. Please check your native module setup.');
}

class InterswitchPOSService {
  private eventEmitter: NativeEventEmitter;
  private paymentCompletedListener: EmitterSubscription | null = null;
  private paymentCancelledListener: EmitterSubscription | null = null;
  private printCompletedListener: EmitterSubscription | null = null;
  private printErrorListener: EmitterSubscription | null = null;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(InterswitchPosModule);
  }

  /**
   * Initialize the SmartPOS terminal with configuration
   */
  async initializeTerminal(config?: TerminalConfig): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Use default test configuration if none provided
      const terminalConfig: TerminalConfig = {
        environment: 'TEST',
        appVersion: '1.0.0',
        ...config
      };
      
      console.log('Initializing terminal with config:', terminalConfig);
      
      const result = await InterswitchPosModule.initializeTerminal(terminalConfig);
      
      if (result && result.success) {
        console.log('Terminal initialized successfully:', result.message);
        return { success: true, message: result.message };
      } else {
        console.error('Terminal initialization failed:', result);
        return { success: false, error: 'Terminal initialization failed' };
      }
    } catch (error: any) {
      console.error('Terminal initialization error:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Set company logo for receipts
   */
  async setCompanyLogo(logoConfig: LogoConfig): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('Setting company logo:', logoConfig.type);
      
      const result = await InterswitchPosModule.setCompanyLogo(logoConfig);
      
      if (result && result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, error: 'Failed to set company logo' };
      }
    } catch (error: any) {
      console.error('Set logo error:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Make a payment using SmartPOS SDK
   */
  async makePayment(paymentData: PaymentData): Promise<{ success: boolean; data?: PaymentResult; error?: string }> {
    try {
      // Validate required fields
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Valid amount is required');
      }

      // Validate amount
      const amountValidation = this.validatePaymentAmount(paymentData.amount);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
      }

      const paymentInfo = {
        amount: paymentData.amount, // Native module handles Naira to kobo conversion
        paymentType: paymentData.paymentType || 'Card',
        reference: paymentData.reference || await this.generateTransactionReference(),
        remark: paymentData.remark || 'Payment transaction',
      };

      console.log('Initiating payment:', paymentInfo);

      // Call the native module - result will come through event listeners
      const result = await InterswitchPosModule.makePayment(paymentInfo);
      
      // The native module will trigger events for the actual result
      // This method just initiates the payment process
      return { success: true };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return { success: false, error: error.message || 'Failed to initiate payment' };
    }
  }

  /**
   * Print receipt with formatted data
   */
  async printReceipt(printData: PrintItem[]): Promise<{ success: boolean; data?: PrintResult; error?: string }> {
    try {
      if (!printData || printData.length === 0) {
        throw new Error('Print data is required');
      }

      console.log('Printing receipt with', printData.length, 'items');

      const result = await InterswitchPosModule.printReceipt(printData);
      
      if (result && result.success) {
        return { success: true, data: result };
      } else {
        return { success: false, error: result?.message || 'Print failed' };
      }
    } catch (error: any) {
      console.error('Print error:', error);
      return { success: false, error: error.message || 'Failed to print receipt' };
    }
  }

  /**
   * Show terminal settings screen
   */
  async showSettings(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const result = await InterswitchPosModule.showSettings();
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Settings error:', error);
      return { success: false, error: error.message || 'Failed to open settings' };
    }
  }

  /**
   * Call home to sync with server
   */
  async callHome(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const result = await InterswitchPosModule.callHome();
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Call home error:', error);
      return { success: false, error: error.message || 'Failed to sync with server' };
    }
  }

  /**
   * Get terminal information
   */
  async getTerminalInfo(): Promise<{ success: boolean; data?: TerminalInfo; error?: string }> {
    try {
      const result = await InterswitchPosModule.getTerminalInfo();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Get terminal info error:', error);
      return { success: false, error: error.message || 'Failed to get terminal info' };
    }
  }

  /**
   * Generate a unique transaction reference
   */
  async generateTransactionReference(): Promise<string> {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `TXN_${timestamp}_${randomNum}`;
  }

  /**
   * Convert amount from Naira to Kobo (for manual calculations)
   */
  nairaToKobo(nairaAmount: number): number {
    return Math.round(nairaAmount * 100);
  }

  /**
   * Convert amount from Kobo to Naira (for manual calculations)
   */
  koboToNaira(koboAmount: number): number {
    return koboAmount / 100;
  }

  /**
   * Create a standard receipt format
   */
  createStandardReceipt(transactionData: PaymentResult, merchantInfo?: {
    name?: string;
    address?: string;
    phone?: string;
  }): PrintItem[] {
    const receipt: PrintItem[] = [];

    // Company logo (if available)
    receipt.push({
      type: 'image',
      imageType: 'resource',
      resourceName: 'logo' // Make sure you have a logo.png in android/app/src/main/res/drawable/
    });

    // Merchant header
    if (merchantInfo?.name) {
      receipt.push({
        type: 'text',
        text: merchantInfo.name,
        isTitle: true,
        displayCenter: true,
        isBold: true
      });
    }

    if (merchantInfo?.address) {
      receipt.push({
        type: 'text',
        text: merchantInfo.address,
        displayCenter: true
      });
    }

    if (merchantInfo?.phone) {
      receipt.push({
        type: 'text',
        text: `Tel: ${merchantInfo.phone}`,
        displayCenter: true
      });
    }

    receipt.push({ type: 'separator' });

    // Transaction header
    receipt.push({
      type: 'text',
      text: 'PAYMENT RECEIPT',
      isTitle: true,
      displayCenter: true,
      isBold: true
    });

    receipt.push({ type: 'newline' });

    // Transaction details
    receipt.push({
      type: 'text',
      text: `Amount: ₦${transactionData.amount.toFixed(2)}`,
      isBold: true
    });

    if (transactionData.cardType) {
      receipt.push({
        type: 'text',
        text: `Card Type: ${transactionData.cardType}`
      });
    }

    if (transactionData.cardPan) {
      receipt.push({
        type: 'text',
        text: `PAN: ${transactionData.cardPan}`
      });
    }

    if (transactionData.rrn) {
      receipt.push({
        type: 'text',
        text: `RRN: ${transactionData.rrn}`
      });
    }

    receipt.push({
      type: 'text',
      text: `Reference: ${transactionData.transactionReference}`
    });

    if (transactionData.dateTime) {
      receipt.push({
        type: 'text',
        text: `Date: ${transactionData.dateTime}`
      });
    }

    if (transactionData.authorizationCode) {
      receipt.push({
        type: 'text',
        text: `Auth Code: ${transactionData.authorizationCode}`
      });
    }

    if (transactionData.stan) {
      receipt.push({
        type: 'text',
        text: `STAN: ${transactionData.stan}`
      });
    }

    receipt.push({ type: 'separator' });

    // Transaction status
    const statusText = transactionData.isSuccessful ? 'APPROVED' : 'DECLINED';
    receipt.push({
      type: 'text',
      text: statusText,
      isTitle: true,
      displayCenter: true,
      isBold: true
    });

    receipt.push({ type: 'newline' });
    receipt.push({ type: 'newline' });

    // Footer
    receipt.push({
      type: 'text',
      text: 'Thank you for your business!',
      displayCenter: true
    });

    receipt.push({ type: 'newline' });
    receipt.push({
      type: 'text',
      text: 'Keep this receipt for your records',
      displayCenter: true
    });

    return receipt;
  }

  /**
   * Add event listeners for payment and print callbacks
   */
  addEventListeners(callbacks: {
    onPaymentCompleted?: (result: PaymentResult) => void;
    onPaymentCancelled?: (result: any) => void;
    onPrintCompleted?: (result: PrintResult) => void;
    onPrintError?: (result: PrintResult) => void;
  }) {
    console.log('Adding event listeners for POS events');
    
    // Remove existing listeners first
    this.removeEventListeners();

    if (callbacks.onPaymentCompleted) {
      this.paymentCompletedListener = this.eventEmitter.addListener(
        'onPaymentCompleted',
        (result: PaymentResult) => {
          console.log('Payment completed event received:', result);
          callbacks.onPaymentCompleted!(result);
        }
      );
    }

    if (callbacks.onPaymentCancelled) {
      this.paymentCancelledListener = this.eventEmitter.addListener(
        'onPaymentCancelled',
        (result: any) => {
          console.log('Payment cancelled event received:', result);
          callbacks.onPaymentCancelled!(result);
        }
      );
    }

    if (callbacks.onPrintCompleted) {
      this.printCompletedListener = this.eventEmitter.addListener(
        'onPrintCompleted',
        (result: PrintResult) => {
          console.log('Print completed event received:', result);
          callbacks.onPrintCompleted!(result);
        }
      );
    }

    if (callbacks.onPrintError) {
      this.printErrorListener = this.eventEmitter.addListener(
        'onPrintError',
        (result: PrintResult) => {
          console.log('Print error event received:', result);
          callbacks.onPrintError!(result);
        }
      );
    }
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    console.log('Removing POS event listeners');
    
    if (this.paymentCompletedListener) {
      this.paymentCompletedListener.remove();
      this.paymentCompletedListener = null;
    }

    if (this.paymentCancelledListener) {
      this.paymentCancelledListener.remove();
      this.paymentCancelledListener = null;
    }

    if (this.printCompletedListener) {
      this.printCompletedListener.remove();
      this.printCompletedListener = null;
    }

    if (this.printErrorListener) {
      this.printErrorListener.remove();
      this.printErrorListener = null;
    }
  }

  /**
   * Get module constants
   */
  getConstants() {
    return InterswitchPosModule.getConstants ? InterswitchPosModule.getConstants() : {};
  }

  /**
   * Check if terminal is ready for transactions
   */
  async isTerminalReady(): Promise<boolean> {
    try {
      const info = await this.getTerminalInfo();
      return info.success && info.data?.isInitialized === true;
    } catch (error) {
      console.error('Terminal ready check error:', error);
      return false;
    }
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (!amount || typeof amount !== 'number') {
      return { valid: false, error: 'Amount must be a valid number' };
    }

    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than zero' };
    }

    if (amount < 10) {
      return { valid: false, error: 'Minimum amount is ₦10' };
    }

    if (amount > 999999.99) {
      return { valid: false, error: 'Amount exceeds maximum limit (₦999,999.99)' };
    }

    // Check for more than 2 decimal places
    if (Math.round(amount * 100) !== amount * 100) {
      return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
    }

    return { valid: true };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Create a simple text receipt (for testing)
   */
  createSimpleReceipt(transactionData: PaymentResult): PrintItem[] {
    return [
      {
        type: 'text',
        text: 'PAYMENT RECEIPT',
        isTitle: true,
        displayCenter: true,
        isBold: true
      },
      { type: 'separator' },
      {
        type: 'text',
        text: `Amount: ${this.formatCurrency(transactionData.amount)}`,
        isBold: true
      },
      {
        type: 'text',
        text: `Reference: ${transactionData.transactionReference}`
      },
      {
        type: 'text',
        text: `Status: ${transactionData.isSuccessful ? 'APPROVED' : 'DECLINED'}`,
        isBold: true,
        displayCenter: true
      },
      { type: 'separator' },
      {
        type: 'text',
        text: 'Thank you!',
        displayCenter: true
      }
    ];
  }

  /**
   * Test native module connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!InterswitchPosModule) {
        return { 
          success: false, 
          message: 'Native module not found. Check if the module is properly linked.' 
        };
      }

      const constants = this.getConstants();
      console.log('Native module constants:', constants);

      return { 
        success: true, 
        message: `Native module connected. SDK Version: ${constants.SDK_VERSION || 'Unknown'}` 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection test failed: ${error.message}` 
      };
    }
  }
}

// Create and export singleton instance
const interswitchPOSService = new InterswitchPOSService();
export default interswitchPOSService;

// Export types for use in other files
export type {
  LogoConfig,
  PaymentData,
  PaymentResult,
  PrintItem,
  PrintResult, SuccessResult, TerminalConfig, TerminalInfo
};
