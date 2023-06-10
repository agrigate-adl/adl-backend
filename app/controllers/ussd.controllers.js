const UssdMenu = require('ussd-builder');

let menu = new UssdMenu();

const db = require("../models/index");
//*384*11472*1#

const Farmers = db.Farmers;
const Packages = db.FPackages
const sc = db.ScratchCards;
const Transactions  = db.Transactions;

let foi;
let arrayOfPacks = []
let selectedPackage;

const africastalking = require('africastalking')({
    apiKey: process.env.AFRICA_TALKING_API_KEY,
    username: process.env.AFRICA_TALKING_USERNAME
});

menu.startState({
    run: () => {
    // use menu.con() to send response without terminating session
    menu.con('Welcome to Agrigate installment payments. Please follow the instruction' +
    '\n1. To enter farmers phone number' +
    '\n2. Quit');
    },
    // next object links to next state based on user input
    next: {
    '1': 'farmerPhone',
    '2': 'quit'
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
menu.state('packages', {
    run: async () => {
     let numberTel = menu.val;;
    // get farmer's packages
    //map package number and name
    const query = {contact:numberTel}
    foi =  await Farmers.findOne(query);
    if(foi !== null){
        if(foi.packages && foi.packages.length >0){
        foi.packages.forEach((element,index )=> {
            if(element.status==='pending'){
             const change = (Number(foi.packages[index].totalDue - foi.packages[index].balance))
             arrayOfPacks.push('\n'+(index+1)+'. '+element.name+', due:'+ 
             change.toString())
            }
        });
        menu.con('Please select package to pay for  '+ foi.name +
        arrayOfPacks.join(',')
        );
        }else{
            menu.end(foi.name + ' '+ 'has no pending packages'); 
        }
    }else{
        menu.end('Failed to get farmer with that phone number. Please register or try again');
    }
    },
    next: {
     '*[0-9]+': 'card'
    }
    });
menu.state('card', {
        run: async () => {
         //empty array
         arrayOfPacks = []
         selectedPackage = Number(menu.val) - 1;
         // get package by id
         // if val is out of index range, quit. else get card
        const change = (Number(foi.packages[selectedPackage].totalDue - foi.packages[selectedPackage].balance))
        menu.con('Please enter the number on the scratch card for pacakage '+ 
        foi.packages[selectedPackage].name + ':\n'+
        foi.packages[selectedPackage].products.join('\n') +'\n'+
        'with balance:'+ change.toString()
        );
        },
        next: {
         '*[a-zA-Z0-9\-\_]+': 'end'
        }
    });

menu.state('end', {
    run: async () => {
    // make transation, edit farmer, edit package
    let cardNumber = menu.val
    let filter ={ $and: [{"cardNumber":cardNumber}, {"status":"unused"} ]}
    let update = {"status":"used","farmer":foi._id}
    let doc = await sc.findOneAndUpdate(filter, update,{
        new: true, useFindAndModify:false
    });
    if(doc){
        let newBal = (Number(foi.packages[selectedPackage].balance) + Number(doc.amount))
        let packUpdate= {"balance": newBal}
        let newFarmerPackages = foi.packages
        newFarmerPackages[selectedPackage].balance = newBal
        if(newBal >= Number(foi.packages[selectedPackage].totalDue)){
            packUpdate = {...packUpdate, "status":"complete"}
            newFarmerPackages[selectedPackage].balance = "complete"
        }   
        //update package
        let updatedPack =  await Packages.findByIdAndUpdate(foi.packages[selectedPackage].packageID, packUpdate,{
            new: true, useFindAndModify:false
        });
        //update farmer
        await Farmers.findByIdAndUpdate(foi._id, {"packages":newFarmerPackages},{
            new: true, useFindAndModify:false
        });
        //make transaction
        const transaction = new Transactions({
            payee: {
            "name":foi.name,
            "contact": foi.contact,
            "id":foi._id
            },
            package: updatedPack._id,
            amount: Number(doc.amount),
            reference: doc.cardNumber,
          }); 
        let save =  await transaction.save(transaction)
        let change = updatedPack.totalAmount - newBal

        
        menu.end('Payment was successfull. You paid: UGX'+ doc.amount+'.'+
        '\n The balance on the package is: UGX'
        + change +
        '.');
    }else{
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
    menu.run(req.body, ussdResult  => {
        res.send(ussdResult);
    });
    
};

async function sendBulkSMS(recipients, message) {
    try {
      const sms = africastalking.SMS;
      const options = {
        to: recipients,
        // from: 'Agrigate',
        message: message
      };
      const response = await sms.send(options);
      return response;
    } catch (error) {
      //console.error('Error sending SMS:', error);
      throw error;
    }
  }
  async function extractPhoneNumbers(data) {
    const numbers = [];
  
    for (let i = 0; i < data.length; i++) {
      const contact = data[i].contact;
      let phoneNumber = contact.replace(/\D/g, ''); // Remove non-digit characters
  
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
      let phoneNumber = data[i].replace(/\D/g, ''); // Remove non-digit characters
  
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
  const { message,selected,farmers} = req.body;
  //fetch recipients
  let recipients = [];
  if(selected ===false){
  Farmers.find()
  .then(async (data) => {
    //sort list of numbers
    recipients = await extractPhoneNumbers(data);
    // console.log(recipients)
    try {
      const response = await sendBulkSMS(recipients, message);
      res.json({ message:'Success', data:response });
    } catch (error) {
      res.status(500).json({ message:'Failed', data:null });
    }
  }).catch(() => {
    res.status(500).send({
      message: "Failed to fetch farmer contacts",
      data:null
    });
 
  });
}else{
  recipients = await extractSentPhoneNumbers(farmers);
    try {
      const response = await sendBulkSMS(recipients, message);
      res.json({ message:'Success', data:response });
    } catch (error) {
      res.status(500).json({ message:'Failed', data:null });
    }
}
};

