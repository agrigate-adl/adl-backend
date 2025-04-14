const axios = require('axios');
const db = require("../models/index");

const Transactions = db.Transactions;
const Farmers = db.Farmers;
const Packages = db.FPackages;

// Pesapal API configuration
const PESAPAL_API_URL = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';
const PESAPAL_PAYMENT_URL = 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest';
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

/* const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const CALLBACK_PATH = '/mobile-money/callback';
const CALLBACK_URL = `${BASE_URL}${CALLBACK_PATH}`; */

// Function to get Pesapal authentication token
const getPesapalToken = async () => {
    try {
        const response = await axios.post(PESAPAL_API_URL, {
            consumer_key: PESAPAL_CONSUMER_KEY,
            consumer_secret: PESAPAL_CONSUMER_SECRET
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.token;
    } catch (error) {
        console.error('Pesapal token error details:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Pesapal: ' + error.message);
    }
};

// Initiate mobile money payment
exports.initiateMobileMoneyPayment = async (farmer, selectedPackageIndex, phoneNumber) => {
    try {
        const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
        const CALLBACK_PATH = '/mobile-money/callback';
        const CALLBACK_URL = `${BASE_URL}${CALLBACK_PATH}`;
        
        console.log('Callback URL:', CALLBACK_URL);
        const amount = Number(farmer.packages[selectedPackageIndex].totalDue - farmer.packages[selectedPackageIndex].balance);

        try {
            const token = await getPesapalToken();
            
            const paymentData = {
                id: `AGRIGATE_${Date.now()}`,
                currency: 'UGX',
                amount: amount,
                description: `Payment for ${farmer.packages[selectedPackageIndex].name}`,
                callback_url: CALLBACK_URL,
                notification_id: CALLBACK_URL,
                phone_number: phoneNumber,
                first_name: farmer.name.split(' ')[0],
                last_name: farmer.name.split(' ').slice(1).join(' ') || 'N/A',
                email: farmer.email || `${phoneNumber}@agrigate.com`
            };

            console.log('Sending payment request with data:', JSON.stringify(paymentData));

            try {
                const response = await axios.post(PESAPAL_PAYMENT_URL, paymentData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Pesapal response:', JSON.stringify(response.data));

                if (response.data.status === 'PENDING') {
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

                    return {
                        success: true,
                        message: `Mobile money payment of UGX ${amount} initiated successfully. Please complete the payment on your phone.\nFor full transaction statement, visit the nearest branch office.`,
                        orderTrackingId: response.data.order_tracking_id
                    };
                } else {
                    console.log('Unexpected response status:', response.data);
                    return {
                        success: false,
                        message: 'Mobile money payment failed. Please try again.'
                    };
                }
            } catch (axiosError) {
                console.error('Pesapal API error:', axiosError.response?.data || axiosError.message);
                return {
                    success: false,
                    message: 'Mobile money payment failed. Error communicating with payment provider.'
                };
            }
        } catch (tokenError) {
            console.error('Token error:', tokenError);
            return {
                success: false,
                message: 'Mobile money payment failed. Authentication error with payment provider.'
            };
        }
    } catch (generalError) {
        console.error('General error in mobile money payment:', generalError);
        return {
            success: false,
            message: 'Mobile money payment failed. System error occurred.'
        };
    }
};

// Callback handler for Pesapal payment confirmation
exports.handlePesapalCallback = async (req, res) => {
    try {
        console.log('Received callback data:', req.body);
        const { order_tracking_id, status } = req.body; // Pesapal sends these in the callback

        if (!order_tracking_id || !status) {
            console.log('Invalid callback data received:', req.body);
            return res.status(400).send({ message: 'Invalid callback data' });
        }

        try {
            const transaction = await Transactions.findOne({ reference: order_tracking_id });
            if (!transaction) {
                console.log('Transaction not found for order_tracking_id:', order_tracking_id);
                return res.status(404).send({ message: 'Transaction not found' });
            }

            if (transaction.status === 'completed') {
                return res.status(200).send({ message: 'Transaction already processed' });
            }

            if (status === 'COMPLETED') {
                // Update transaction status
                transaction.status = 'completed';
                await transaction.save();

                // Update package and farmer records
                const farmer = await Farmers.findById(transaction.payee.id);
                if (!farmer) {
                    console.error('Farmer not found for id:', transaction.payee.id);
                    return res.status(404).send({ message: 'Farmer not found' });
                }

                const packageIndex = farmer.packages.findIndex(p => p.packageID === transaction.package);
                if (packageIndex === -1) {
                    console.error('Package not found in farmer data:', transaction.package);
                    return res.status(404).send({ message: 'Package not found for farmer' });
                }

                let newBal = Number(farmer.packages[packageIndex].balance) + transaction.amount;
                let packUpdate = { "balance": newBal };

                if (newBal >= Number(farmer.packages[packageIndex].totalDue)) {
                    packUpdate = { ...packUpdate, "status": "complete" };
                    farmer.packages[packageIndex].status = "complete";
                }
                farmer.packages[packageIndex].balance = newBal;

                await Packages.findByIdAndUpdate(farmer.packages[packageIndex].packageID, packUpdate, {
                    new: true, useFindAndModify: false
                });
                await Farmers.findByIdAndUpdate(farmer._id, { "packages": farmer.packages }, {
                    new: true, useFindAndModify: false
                });

                res.status(200).send({ message: 'Payment confirmed and updated successfully' });
            } else if (status === 'FAILED' || status === 'INVALID') {
                transaction.status = 'failed';
                await transaction.save();
                res.status(200).send({ message: 'Payment failed and updated' });
            } else {
                res.status(200).send({ message: 'Payment status pending, no update required' });
            }
        } catch (dbError) {
            console.error('Database error in callback handler:', dbError);
            res.status(500).send({ message: 'Error processing callback: Database error' });
        }
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).send({ message: 'Error processing callback: ' + error.message });
    }
};