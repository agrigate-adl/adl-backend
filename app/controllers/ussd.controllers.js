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
    foi =  await Farmers.findOne(query);
    if(foi !== null){
        if(foi.packages && foi.packages.length >0){
        foi.packages.forEach((element,index )=> {
            if(element.status==='pending'){
             arrayOfPacks.push('\n'+(index+1)+'. '+element.name+', due:'+element.balance)
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
         //
         selectedPackage = Number(menu.val) - 1;
         // get package by id
         // if val is out of index range, quit. else get card
         
        menu.con('Please enter the number on the scratch card for pacakage '+ 
        foi.packages[selectedPackage].name + ':'+
        foi.packages[selectedPackage].products.join('\n') +'\n'+
        'with balance:'+ foi.packages[selectedPackage].balance);
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

        console.log(change)
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
    // const query = {contact:"0706081432"}
    // foi =  await Farmers.findOne(query);
    // console.log(foi._id)
    // let filter ={ $and: [{"cardNumber":10546923795083}, {"status":"used"} ]}
    // let update = {"status":"used","farmer":foi._id}
    // let doc = await sc.findOneAndUpdate(filter, update,{
    //     new: true, useFindAndModify:false
    // });
    // if(doc){
    //     console.log(foi.packages)
    //     let newBal = (Number(foi.packages[0].balance) + Number(doc.amount))
    //     packUpdate= {"balance": newBal}
    //     newFarmerPackages = foi.packages
    //     newFarmerPackages[0].balance = newBal
    //     if(newBal >= Number(foi.packages[0].totalDue)){
    //         packUpdate = {...packUpdate, "status":"complete"}
    //         newFarmerPackages[0].balance = "complete"
    //     }   
    //     console.log(packUpdate)
    //     //update
    //     let updatedPack = await Packages.findByIdAndUpdate(foi.packages[0].packageID, packUpdate,{
    //         new: true, useFindAndModify:false
    //     });
    //     console.log(updatedPack)
    //     //update farmer
    //     let updatedfoi = await Farmers.findByIdAndUpdate(foi._id, {"packages":newFarmerPackages},{
    //         new: true, useFindAndModify:false
    //     });
    //     console.log("farmer")
    //     console.log(updatedfoi)
    //     //make transaction
    //     const transaction = new Transactions({
    //         payee: {
    //         "name":foi.name,
    //         "contact": foi.contact
    //         },
    //         package: updatedPack._id,
    //         amount: Number(doc.amount),
    //         reference: "xyz",
    //       }); 
    //     let save =  await transaction.save(transaction)
    //     console.log(save)
    //     let change = updatedPack.totalAmount - newBal
    //     console.log(updatedPack.totalAmount)
    //     console.log(newBal)
    //     console.log(change)
       
    // }else{
    //     console.log('invalid number')
    // }
    menu.run(req.body, ussdResult  => {
        res.send(ussdResult);
    });
    
};
