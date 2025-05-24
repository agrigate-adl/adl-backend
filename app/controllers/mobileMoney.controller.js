const axios = require('axios');
const db = require("../models/index");

const Transactions = db.Transactions;
const Farmers = db.Farmers;
const Packages = db.FPackages;

// FIXED: Use correct Pesapal API URLs
const getPesapalConfig = () => {
  return {
    // Use sandbox for testing, production for live
    API_URL: process.env.PESAPAL_BASE_API_URL || 'https://cybqa.pesapal.com/pesapalv3/api',
    CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY,
    CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET,
    BASE_URL: process.env.BASE_URL || 'https://adl-master-5bnt.onrender.com'
  };
};

// Simple debug function that safely shows credentials
const debugCredentials = () => {
  const config = getPesapalConfig();
  console.log('\n=== API Credentials Debug ===');
  
  // Log environment variables
  console.log('PESAPAL_BASE_API_URL:', process.env.PESAPAL_BASE_API_URL);
  console.log('CONSUMER_KEY exists:', !!config.CONSUMER_KEY);
  console.log('CONSUMER_SECRET exists:', !!config.CONSUMER_SECRET);
  
  // Length checks
  console.log('CONSUMER_KEY length:', config.CONSUMER_KEY ? config.CONSUMER_KEY.length : 0);
  console.log('CONSUMER_SECRET length:', config.CONSUMER_SECRET ? config.CONSUMER_SECRET.length : 0);
  
  // API URLs
  console.log('AUTH_URL:', `${config.API_URL}/Auth/RequestToken`);
  console.log('PAYMENT_URL:', `${config.API_URL}/Transactions/SubmitOrderRequest`);
  console.log('BASE_URL:', config.BASE_URL);
  console.log('=== End Debug ===\n');
  
  return config;
};

// FIXED: Function to get Pesapal token with proper error handling
const getPesapalToken = async () => {
    try {
        // Get fresh configuration and debug
        const config = debugCredentials();
        
        // Validate credentials
        if (!config.CONSUMER_KEY || !config.CONSUMER_SECRET) {
            throw new Error('Missing Pesapal API credentials in environment variables');
        }
        
        console.log('Requesting Pesapal token...');
        
        // Create payload exactly as shown in documentation
        const payload = {
            consumer_key: config.CONSUMER_KEY,
            consumer_secret: config.CONSUMER_SECRET
        };
        
        console.log('Request payload structure matches documentation');
        
        // Send request with proper URL path and headers
        const authUrl = `${config.API_URL}/Auth/RequestToken`;
        console.log('Sending request to:', authUrl);
        
        const response = await axios.post(authUrl, payload, {
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        // Log complete raw response for debugging
        console.log('Token response status:', response.status);
        console.log('Complete raw response:', JSON.stringify(response.data));
        
        // Validate response
        if (response.data && response.data.token) {
            const token = response.data.token;
            console.log('Token received successfully (length):', token.length);
            return token;
        } else {
            console.error('Response does not contain token:', JSON.stringify(response.data));
            throw new Error('Invalid response format from authentication endpoint');
        }
    } catch (error) {
        console.error('Authentication error:');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data));
        } else if (error.request) {
            console.error('No response received from authentication API');
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};

// Register IPN URL with Pesapal (call this once during setup)
const registerIPNUrl = async () => {
    try {
        const config = getPesapalConfig();
        const token = await getPesapalToken();
        
        const ipnData = {
            url: `${config.BASE_URL}/mobile-money/ipn`,
            ipn_notification_type: "POST"
        };
        
        const response = await axios.post(
            `${config.API_URL}/URLSetup/RegisterIPN`,
            ipnData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        
        console.log('IPN registration response:', response.data);
        return response.data.ipn_id;
    } catch (error) {
        console.error('IPN registration error:', error.response?.data || error.message);
        throw error;
    }
};

// FIXED: Initiate mobile money payment with correct API structure
exports.initiateMobileMoneyPayment = async (farmer, selectedPackageIndex, phoneNumber) => {
    try {
        console.log('\n=== Initiating Mobile Money Payment ===');
        console.log('Farmer:', farmer.name);
        console.log('Package:', farmer.packages[selectedPackageIndex].name);
        console.log('Phone:', phoneNumber);
        
        // Get fresh configuration
        const config = getPesapalConfig();
        const CALLBACK_PATH = '/mobile-money/callback';
        const CALLBACK_URL = `${config.BASE_URL}${CALLBACK_PATH}`;
        
        console.log('Callback URL:', CALLBACK_URL);
        
        // Calculate amount
        const amount = Number(farmer.packages[selectedPackageIndex].totalDue - farmer.packages[selectedPackageIndex].balance);
        console.log('Payment amount:', amount, 'UGX');

        // Get authentication token
        let token;
        try {
            token = await getPesapalToken();
            if (!token) {
                throw new Error('Failed to obtain authentication token');
            }
        } catch (tokenError) {
            console.error('Failed to get Pesapal token:', tokenError.message);
            return {
                success: false,
                message: 'Mobile money payment failed. Authentication error with payment provider.'
            };
        }
        
        // Format phone number for Uganda
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '256' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('256')) {
            formattedPhone = '256' + formattedPhone;
        }
        
        // Create transaction ID
        const transactionId = `AGRIGATE_${Date.now()}`;
        
        // FIXED: Prepare payment data with correct Pesapal API 3.0 structure
        const paymentData = {
            id: transactionId,
            currency: 'UGX',
            amount: amount,
            description: `Payment for ${farmer.packages[selectedPackageIndex].name}`,
            callback_url: CALLBACK_URL,
            notification_id: `${config.BASE_URL}/mobile-money/ipn`, // This should be IPN URL
            billing_address: {
                email_address: farmer.email || `${formattedPhone}@agrigate.com`,
                phone_number: formattedPhone,
                country_code: "UG",
                first_name: farmer.name.split(' ')[0] || 'Farmer',
                middle_name: "",
                last_name: farmer.name.split(' ').slice(1).join(' ') || 'User',
                line_1: "Kampala",
                line_2: "",
                city: "Kampala",
                state: "Central",
                postal_code: "00100",
                zip_code: "00100"
            }
        };

        console.log('Sending payment request with data:', JSON.stringify(paymentData, null, 2));

        try {
            // Send payment request
            const paymentUrl = `${config.API_URL}/Transactions/SubmitOrderRequest`;
            console.log('Sending payment request to:', paymentUrl);
            
            const response = await axios.post(paymentUrl, paymentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Pesapal payment response:', JSON.stringify(response.data, null, 2));

            // FIXED: Process the response correctly
            if (response.data && response.data.order_tracking_id) {
                // Create a pending transaction
                const transaction = new Transactions({
                    payee: {
                        "name": farmer.name,
                        "contact": farmer.contact,
                        "id": farmer._id
                    },
                    package: farmer.packages[selectedPackageIndex].packageID,
                    amount: amount,
                    reference: response.data.order_tracking_id,
                    status: 'pending'
                });
                await transaction.save();
                console.log('Transaction created in database');

                return {
                    success: true,
                    message: `Mobile money payment of UGX ${amount} initiated successfully. Please complete the payment on your phone.\nFor full transaction statement, visit the nearest branch office.`,
                    orderTrackingId: response.data.order_tracking_id,
                    redirectUrl: response.data.redirect_url // Pesapal provides this for payment page
                };
            } else {
                console.error('Unexpected response format:', JSON.stringify(response.data));
                return {
                    success: false,
                    message: 'Mobile money payment failed. Unexpected response from payment provider.'
                };
            }
        } catch (apiError) {
            console.error('Pesapal payment API error:');
            
            if (apiError.response) {
                console.error('Response status:', apiError.response.status);
                console.error('Response data:', JSON.stringify(apiError.response.data));
                
                return {
                    success: false,
                    message: `Mobile money payment failed: ${apiError.response.data?.error || 'Error communicating with payment provider'}`
                };
            } else if (apiError.request) {
                console.error('No response received from payment API');
                return {
                    success: false,
                    message: 'Mobile money payment failed. No response from payment provider.'
                };
            } else {
                console.error('Request setup error:', apiError.message);
                return {
                    success: false,
                    message: 'Mobile money payment failed. System error occurred.'
                };
            }
        }
    } catch (generalError) {
        console.error('General error in mobile money payment:', generalError);
        return {
            success: false,
            message: 'Mobile money payment failed. System error occurred.'
        };
    } finally {
        console.log('=== End Mobile Money Payment Process ===\n');
    }
};

// NEW: Handle IPN notifications from Pesapal
exports.handleIPN = async (req, res) => {
    try {
        console.log('\n=== Processing Pesapal IPN ===');
        console.log('IPN received:', {
            method: req.method,
            query: req.query,
            body: req.body
        });

        // Extract tracking details (Pesapal sends via query params or body)
        const OrderTrackingId = req.query.OrderTrackingId || req.body.OrderTrackingId;
        const OrderMerchantReference = req.query.OrderMerchantReference || req.body.OrderMerchantReference;

        if (!OrderTrackingId) {
            console.log('Missing OrderTrackingId in IPN');
            return res.status(200).send('OK'); // Still return 200 to acknowledge
        }

        console.log('Processing IPN for OrderTrackingId:', OrderTrackingId);

        // Find the transaction
        const transaction = await Transactions.findOne({ reference: OrderTrackingId });
        if (!transaction) {
            console.log('Transaction not found for OrderTrackingId:', OrderTrackingId);
            return res.status(200).send('OK'); // Still acknowledge
        }

        // Skip already completed transactions
        if (transaction.status === 'completed') {
            console.log('Transaction already processed, skipping');
            return res.status(200).send('OK');
        }

        // Verify transaction status with Pesapal
        try {
            const transactionStatus = await verifyTransactionStatus(OrderTrackingId);
            
            if (transactionStatus) {
                // Update based on verified status
                if (transactionStatus.payment_status_description === 'Completed') {
                    await processCompletedPayment(transaction);
                } else if (transactionStatus.payment_status_description === 'Failed') {
                    transaction.status = 'failed';
                    await transaction.save();
                    console.log('Transaction marked as failed via IPN');
                }
            }
        } catch (verifyError) {
            console.error('Error verifying transaction status:', verifyError.message);
        }

        // Always respond with 200 to acknowledge receipt
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('IPN handling error:', error);
        res.status(200).send('OK'); // Still acknowledge even if error occurred
    } finally {
        console.log('=== End IPN Processing ===\n');
    }
};

// Verify transaction status with Pesapal
const verifyTransactionStatus = async (orderTrackingId) => {
    try {
        const config = getPesapalConfig();
        const token = await getPesapalToken();
        
        const response = await axios.get(
            `${config.API_URL}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        console.log('Transaction status verification:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying transaction:', error.response?.data || error.message);
        return null;
    }
};

// Helper function to process completed payments
const processCompletedPayment = async (transaction) => {
    try {
        console.log('Processing completed payment for transaction:', transaction.reference);
        
        // Update transaction status
        transaction.status = 'completed';
        await transaction.save();

        // Find farmer
        const farmer = await Farmers.findById(transaction.payee.id);
        if (!farmer) {
            console.error('Farmer not found:', transaction.payee.id);
            return;
        }

        // Find package in farmer's packages
        const packageIndex = farmer.packages.findIndex(p => 
            p.packageID.toString() === transaction.package.toString()
        );
        
        if (packageIndex === -1) {
            console.error('Package not found in farmer data:', transaction.package);
            return;
        }

        // Update package balance
        let newBal = Number(farmer.packages[packageIndex].balance) + transaction.amount;
        let packUpdate = { "balance": newBal };

        // Check if package is fully paid
        if (newBal >= Number(farmer.packages[packageIndex].totalDue)) {
            packUpdate = { ...packUpdate, "status": "complete" };
            farmer.packages[packageIndex].status = "complete";
        }
        
        farmer.packages[packageIndex].balance = newBal;

        // Update package in database
        await Packages.findByIdAndUpdate(
            farmer.packages[packageIndex].packageID, 
            packUpdate, 
            { new: true, useFindAndModify: false }
        );
        
        // Update farmer in database
        await Farmers.findByIdAndUpdate(
            farmer._id, 
            { "packages": farmer.packages }, 
            { new: true, useFindAndModify: false }
        );

        console.log('Payment records updated successfully via IPN');
    } catch (error) {
        console.error('Error processing completed payment:', error);
    }
};

// IMPROVED: Callback handler with transaction verification
exports.handlePesapalCallback = async (req, res) => {
    console.log('\n=== Processing Pesapal Callback ===');
    console.log('Callback data:', req.body);
    console.log('Query parameters:', req.query);
    
    try {
        // Check both body and query parameters
        const orderTrackingId = req.body?.order_tracking_id || req.query?.order_tracking_id || 
                              req.body?.OrderTrackingId || req.query?.OrderTrackingId;

        if (!orderTrackingId) {
            console.error('Missing order tracking ID in callback');
            return res.status(400).send({ message: 'Invalid callback data: Missing order tracking ID' });
        }

        // Verify transaction status with Pesapal instead of trusting callback data
        const transactionStatus = await verifyTransactionStatus(orderTrackingId);
        
        if (transactionStatus) {
            const transaction = await Transactions.findOne({ reference: orderTrackingId });
            if (transaction && transaction.status !== 'completed') {
                if (transactionStatus.payment_status_description === 'Completed') {
                    await processCompletedPayment(transaction);
                    res.status(200).send({ message: 'Payment completed and updated successfully' });
                } else if (transactionStatus.payment_status_description === 'Failed') {
                    transaction.status = 'failed';
                    await transaction.save();
                    res.status(200).send({ message: 'Payment failed and updated' });
                } else {
                    res.status(200).send({ message: 'Payment status pending' });
                }
            } else {
                res.status(200).send({ message: 'Transaction already processed or not found' });
            }
        } else {
            res.status(200).send({ message: 'Unable to verify transaction status' });
        }
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).send({ message: 'Error processing callback: ' + error.message });
    } finally {
        console.log('=== End Callback Processing ===\n');
    }
};

// Export the IPN registration function for setup
exports.registerIPNUrl = registerIPNUrl;