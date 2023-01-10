const UssdMenu = require('ussd-builder');
let menu = new UssdMenu();

const db = require("../models/index");

const Farmers = db.Farmers;
const Packages = db.FPackages
const sc = db.ScratchCards;
const Transactions  = db.Transactions;


menu.startState({
    run: () => {
    // use menu.con() to send response without terminating session
    menu.con('Welcome to ADL installment payments. Please follow the instruction' +
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
    let f =  await Farmers.findOne(query);

    if(farmerOfIntrest !== null){
        menu.con('Please select package to pay for'+ f.name +
        '\n1. Test'
        );
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
         let selectedPackageNo = menu.val;
         // get package by id
         // if val is out of index range, quit. else get card
        menu.con('Please enter the number on the scratch card '+ selectedPackageNo);
        },
        next: {
         '*[a-zA-Z0-9\-\_]+': 'end'
        }
    });

menu.state('end', {
    run: async () => {
    // let tickets = menu.val;
    // dataToSave.tickets = tickets;
    // console.log(dataToSave);
    // // Save the data
    // const data = new Model({
    // name: dataToSave.name,
    // tickets: dataToSave.tickets
    // });
    // const dataSaved = await data.save();

    // make transation, edit farmer, edit package
    menu.end('Awesome! Payment was successfull');
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
