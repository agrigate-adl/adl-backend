const UssdMenu = require('ussd-builder');
const db = require("../models/index");
const mobileMoneyController = require('./mobileMoney.controller');
//*384*11472*1#
let menu = new UssdMenu();

const Farmers = db.Farmers;
const Packages = db.FPackages;
const Transactions = db.Transactions;

let foi;
let arrayOfPacks = [];
let selectedPackage;

const africastalking = require('africastalking')({
    apiKey: process.env.AFRICA_TALKING_API_KEY,
    username: process.env.AFRICA_TALKING_USERNAME
});

menu.startState({
    run: () => {
        menu.con('Welcome to Agrigate installment payments. Please follow the instructions' +
            '\n1. To enter farmer\'s phone number' +
            '\n2. Check balance' +
            '\n3. Quit');
    },
    next: {
        '1': 'farmerPhone',
        '2': 'checkBalance',
        '3': 'quit'
    }
});

menu.state('farmerPhone', {
    run: () => {
        menu.con('Enter the number of the farmer below.');
    },
    next: {
        '*[a-zA-Z0-9\-\_]+': 'packages'
    }
});

menu.state('checkBalance', {
    run: () => {
        menu.con('Enter your phone number to check your balance.');
    },
    next: {
        '*[a-zA-Z0-9\-\_]+': 'showBalance'
    }
});

menu.state('showBalance', {
    run: async () => {
        const phoneNumber = menu.val;
        const farmer = await Farmers.findOne({ contact: phoneNumber });
        if (farmer) {
            let balanceMessage = `Balance for ${farmer.name}:\n`;
            if (farmer.packages && farmer.packages.length > 0) {
                farmer.packages.forEach((pkg, index) => {
                    const balanceDue = Number(pkg.totalDue) - Number(pkg.balance);
                    balanceMessage += `${index + 1}. ${pkg.name}: UGX ${balanceDue}\n`;
                });
                menu.end(balanceMessage + '\nFor full transaction statement, visit the nearest branch office.');
            } else {
                menu.end(`${farmer.name} has no packages.\nFor full transaction statement, visit the nearest branch office.`);
            }
        } else {
            menu.end('Farmer not found. Please register or try again.');
        }
    }
});

menu.state('packages', {
    run: async () => {
        let numberTel = menu.val;
        const query = { contact: numberTel };
        foi = await Farmers.findOne(query);
        if (foi !== null) {
            if (foi.packages && foi.packages.length > 0) {
                foi.packages.forEach((element, index) => {
                    if (element.status === 'pending') {
                        const change = Number(foi.packages[index].totalDue - foi.packages[index].balance);
                        arrayOfPacks.push('\n' + (index + 1) + '. ' + element.name + ', due:' + change.toString());
                    }
                });
                menu.con('Please select package to pay for ' + foi.name +
                    arrayOfPacks.join(','));
            } else {
                menu.end(foi.name + ' has no pending packages');
            }
        } else {
            menu.end('Failed to get farmer with that phone number. Please register or try again');
        }
    },
    next: {
        '*[0-9]+': 'paymentMethod'
    }
});

menu.state('paymentMethod', {
    run: () => {
        selectedPackage = Number(menu.val) - 1;
        const change = Number(foi.packages[selectedPackage].totalDue - foi.packages[selectedPackage].balance);
        menu.con('Select payment method for package ' + foi.packages[selectedPackage].name + ' (Balance: UGX ' + change + '):' +
            '\n1. Scratch Card' +
            '\n2. Mobile Money');
    },
    next: {
        '1': 'card',
        '2': 'mobileMoney'
    }
});

menu.state('card', {
    run: async () => {
        arrayOfPacks = [];
        const change = Number(foi.packages[selectedPackage].totalDue - foi.packages[selectedPackage].balance);
        menu.con('Please enter the number on the scratch card for package ' +
            foi.packages[selectedPackage].name + ':\n' +
            foi.packages[selectedPackage].products.join('\n') + '\n' +
            'with balance:' + change.toString());
    },
    next: {
        '*[a-zA-Z0-9\-\_]+': 'endScratch'
    }
});

menu.state('mobileMoney', {
    run: () => {
        const change = Number(foi.packages[selectedPackage].totalDue - foi.packages[selectedPackage].balance);
        menu.con('Enter your mobile money number to pay UGX ' + change + ' for package ' +
            foi.packages[selectedPackage].name);
    },
    next: {
        '*[a-zA-Z0-9\-\_]+': 'processMobileMoney'
    }
});

menu.state('processMobileMoney', {
    run: async () => {
        const phoneNumber = menu.val;
        const result = await mobileMoneyController.initiateMobileMoneyPayment(foi, selectedPackage, phoneNumber);
        menu.end(result.message);
    }
});

menu.state('endScratch', {
    run: async () => {
        let cardNumber = menu.val;
        let filter = { $and: [{ "cardNumber": cardNumber }, { "status": "unused" }] };
        let update = { "status": "used", "farmer": foi._id };
        let doc = await db.ScratchCards.findOneAndUpdate(filter, update, {
            new: true, useFindAndModify: false
        });
        if (doc) {
            let newBal = Number(foi.packages[selectedPackage].balance) + Number(doc.amount);
            let packUpdate = { "balance": newBal };
            let newFarmerPackages = foi.packages;
            newFarmerPackages[selectedPackage].balance = newBal;
            if (newBal >= Number(foi.packages[selectedPackage].totalDue)) {
                packUpdate = { ...packUpdate, "status": "complete" };
                newFarmerPackages[selectedPackage].status = "complete";
            }
            let updatedPack = await Packages.findByIdAndUpdate(foi.packages[selectedPackage].packageID, packUpdate, {
                new: true, useFindAndModify: false
            });
            await Farmers.findByIdAndUpdate(foi._id, { "packages": newFarmerPackages }, {
                new: true, useFindAndModify: false
            });
            const transaction = new Transactions({
                payee: {
                    "name": foi.name,
                    "contact": foi.contact,
                    "id": foi._id
                },
                package: updatedPack._id,
                amount: Number(doc.amount),
                reference: doc.cardNumber
            });
            await transaction.save();
            let change = updatedPack.totalAmount - newBal;
            menu.end('Payment was successful. You paid: UGX' + doc.amount + '.' +
                '\nThe balance on the package is: UGX' + change +
                '.\nFor full transaction statement, visit the nearest branch office.');
        } else {
            menu.end('Invalid card number');
        }
    }
});

menu.state('quit', {
    run: () => {
        menu.end("Goodbye :)");
    }
});

exports.welcomeFarmer = async (req, res) => {
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
};

// SMS functions remain unchanged
async function sendBulkSMS(recipients, message) {
    try {
        const sms = africastalking.SMS;
        const options = {
            to: recipients,
            message: message
        };
        const response = await sms.send(options);
        return response;
    } catch (error) {
        throw error;
    }
}

async function extractPhoneNumbers(data) {
    const numbers = [];
    for (let i = 0; i < data.length; i++) {
        const contact = data[i].contact;
        let phoneNumber = contact.replace(/\D/g, '');
        if (phoneNumber.length > 0) {
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '+256' + phoneNumber.slice(1);
            }
            numbers.push(phoneNumber);
        }
    }
    return numbers;
}

async function extractSentPhoneNumbers(data) {
    const numbers = [];
    for (let i = 0; i < data.length; i++) {
        let phoneNumber = data[i].replace(/\D/g, '');
        if (phoneNumber.length > 0) {
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '+256' + phoneNumber.slice(1);
            }
            numbers.push(phoneNumber);
        }
    }
    return numbers;
}

exports.sendMessages = async (req, res) => {
    const { message, selected, farmers } = req.body;
    let recipients = [];
    if (selected === false) {
        Farmers.find()
            .then(async (data) => {
                recipients = await extractPhoneNumbers(data);
                try {
                    const response = await sendBulkSMS(recipients, message);
                    res.json({ message: 'Success', data: response });
                } catch (error) {
                    res.status(500).json({ message: 'Failed', data: null });
                }
            }).catch(() => {
                res.status(500).send({
                    message: "Failed to fetch farmer contacts",
                    data: null
                });
            });
    } else {
        recipients = await extractSentPhoneNumbers(farmers);
        try {
            const response = await sendBulkSMS(recipients, message);
            res.json({ message: 'Success', data: response });
        } catch (error) {
            res.status(500).json({ message: 'Failed', data: null });
        }
    }
};