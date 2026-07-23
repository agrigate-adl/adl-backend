const UssdMenu = require("ussd-builder");
const db = require("../models/index");
const mobileMoneyController = require("./mobileMoney.controller");
//*384*11472*1#

const Farmers = db.Farmers;
const Packages = db.FPackages;
const Transactions = db.Transactions;

const africastalking = require("africastalking")({
  apiKey: process.env.AFRICA_TALKING_API_KEY,
  username: process.env.AFRICA_TALKING_USERNAME,
});

// Africa's Talking resends the FULL accumulated input on every request as
// menu.args.text, e.g. "1*0771234567*2*1*CARD123". Route positions:
//   parts[0] = start menu choice (1 = pay, 2 = check balance, 3 = quit)
//   parts[1] = farmer phone number        (farmerPhone state input)
//   parts[2] = package selection (1-based) (packages state input)
//   parts[3] = payment method (1 = card, 2 = mobile money)
//   parts[4] = scratch card / mobile money number
// If the menu graph changes, keep this mapping in sync.
function parseFlowContext(menu) {
  const parts = (menu.args.text || "").split("*");
  return {
    farmerPhone: parts[1],
    selectedPackage: Number(parts[2]) - 1,
  };
}

// Re-fetches the farmer and validates the selected package on every request so
// no state is shared between concurrent USSD sessions and balances are never stale.
async function loadFarmerAndPackage(menu) {
  const { farmerPhone, selectedPackage } = parseFlowContext(menu);
  const farmer = await Farmers.findOne({ contact: farmerPhone });
  if (!farmer) {
    return {
      error:
        "Failed to get farmer with that phone number. Please register or try again",
    };
  }
  if (
    !Number.isInteger(selectedPackage) ||
    selectedPackage < 0 ||
    !farmer.packages ||
    selectedPackage >= farmer.packages.length ||
    farmer.packages[selectedPackage].status !== "pending"
  ) {
    return {
      error:
        "Invalid package selection. Please dial again and choose a listed package number.",
    };
  }
  return { farmer, selectedPackage };
}

// A fresh UssdMenu is built per request: the library instance holds per-request
// mutable state (args, val, onResult), so a shared instance races under
// concurrent sessions.
function createUssdMenu() {
  const menu = new UssdMenu();

  menu.on("error", (err) => {
    console.error("USSD menu error:", err);
    menu.end("An error occurred. Please try again later.");
  });

  menu.startState({
    run: () => {
      menu.con(
        "Welcome to Agrigate installment payments. Please follow the instructions" +
          "\n1. To enter farmer's phone number" +
          "\n2. Check balance" +
          "\n3. Quit"
      );
    },
    next: {
      1: "farmerPhone",
      2: "checkBalance",
      3: "quit",
    },
  });

  menu.state("farmerPhone", {
    run: () => {
      menu.con("Enter the number of the farmer below.");
    },
    next: {
      "*[a-zA-Z0-9-_]+": "packages",
    },
  });

  menu.state("checkBalance", {
    run: () => {
      menu.con("Enter your phone number to check your balance.");
    },
    next: {
      "*[a-zA-Z0-9-_]+": "showBalance",
    },
  });

  menu.state("showBalance", {
    run: async () => {
      try {
        const phoneNumber = menu.val;
        const farmer = await Farmers.findOne({ contact: phoneNumber });
        if (farmer) {
          let balanceMessage = `Balance for ${farmer.name}:\n`;
          if (farmer.packages && farmer.packages.length > 0) {
            farmer.packages.forEach((pkg, index) => {
              const balanceDue = Number(pkg.totalDue) - Number(pkg.balance);
              balanceMessage += `${index + 1}. ${pkg.name}: UGX ${balanceDue}\n`;
            });
            menu.end(
              balanceMessage +
                "\nFor full transaction statement, visit the nearest branch office."
            );
          } else {
            menu.end(
              `${farmer.name} has no packages.\nFor full transaction statement, visit the nearest branch office.`
            );
          }
        } else {
          menu.end("Farmer not found. Please register or try again.");
        }
      } catch (err) {
        console.error("USSD showBalance state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
  });

  menu.state("packages", {
    run: async () => {
      try {
        const arrayOfPacks = [];
        let numberTel = menu.val;
        const query = { contact: numberTel };
        const foi = await Farmers.findOne(query);
        if (foi !== null) {
          if (foi.packages && foi.packages.length > 0) {
            foi.packages.forEach((element, index) => {
              if (element.status === "pending") {
                const change = Number(
                  foi.packages[index].totalDue - foi.packages[index].balance
                );
                arrayOfPacks.push(
                  "\n" +
                    (index + 1) +
                    ". " +
                    element.name +
                    ", due:" +
                    change.toString()
                );
              }
            });
            menu.con(
              "Please select package to pay for " +
                foi.name +
                arrayOfPacks.join(",")
            );
          } else {
            menu.end(foi.name + " has no pending packages");
          }
        } else {
          menu.end(
            "Failed to get farmer with that phone number. Please register or try again"
          );
        }
      } catch (err) {
        console.error("USSD packages state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
    next: {
      "*[0-9]+": "paymentMethod",
    },
  });

  menu.state("paymentMethod", {
    run: async () => {
      try {
        const { farmer, selectedPackage, error } = await loadFarmerAndPackage(
          menu
        );
        if (error) return menu.end(error);
        const change = Number(
          farmer.packages[selectedPackage].totalDue -
            farmer.packages[selectedPackage].balance
        );
        menu.con(
          "Select payment method for package " +
            farmer.packages[selectedPackage].name +
            " (Balance: UGX " +
            change +
            "):" +
            "\n1. Scratch Card" +
            "\n2. Mobile Money"
        );
      } catch (err) {
        console.error("USSD paymentMethod state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
    next: {
      1: "card",
      2: "mobileMoney",
    },
  });

  menu.state("card", {
    run: async () => {
      try {
        const { farmer, selectedPackage, error } = await loadFarmerAndPackage(
          menu
        );
        if (error) return menu.end(error);
        const change = Number(
          farmer.packages[selectedPackage].totalDue -
            farmer.packages[selectedPackage].balance
        );
        menu.con(
          "Please enter the number on the scratch card for package " +
            farmer.packages[selectedPackage].name +
            ":\n" +
            farmer.packages[selectedPackage].products.join("\n") +
            "\n" +
            "with balance:" +
            change.toString()
        );
      } catch (err) {
        console.error("USSD card state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
    next: {
      "*[a-zA-Z0-9-_]+": "endScratch",
    },
  });

  menu.state("mobileMoney", {
    run: async () => {
      try {
        const { farmer, selectedPackage, error } = await loadFarmerAndPackage(
          menu
        );
        if (error) return menu.end(error);
        const change = Number(
          farmer.packages[selectedPackage].totalDue -
            farmer.packages[selectedPackage].balance
        );
        menu.con(
          "Enter your mobile money number to pay UGX " +
            change +
            " for package " +
            farmer.packages[selectedPackage].name
        );
      } catch (err) {
        console.error("USSD mobileMoney state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
    next: {
      "*[a-zA-Z0-9-_]+": "processMobileMoney",
    },
  });

  menu.state("processMobileMoney", {
    run: async () => {
      try {
        const { farmer, selectedPackage, error } = await loadFarmerAndPackage(
          menu
        );
        if (error) return menu.end(error);
        const phoneNumber = menu.val;
        const result = await mobileMoneyController.initiateMobileMoneyPayment(
          farmer,
          selectedPackage,
          phoneNumber
        );
        menu.end(result.message);
      } catch (err) {
        console.error("USSD processMobileMoney state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
  });

  menu.state("endScratch", {
    run: async () => {
      try {
        // Validate the farmer/package BEFORE consuming the scratch card, so an
        // invalid selection never burns a card.
        const { farmer, selectedPackage, error } = await loadFarmerAndPackage(
          menu
        );
        if (error) return menu.end(error);
        let cardNumber = menu.val;
        let filter = {
          $and: [{ cardNumber: cardNumber }, { status: "unused" }],
        };
        let update = { status: "used", farmer: farmer._id };
        let doc = await db.ScratchCards.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false,
        });
        if (doc) {
          let newBal =
            Number(farmer.packages[selectedPackage].balance) +
            Number(doc.amount);
          let packUpdate = { balance: newBal };
          let newFarmerPackages = farmer.packages;
          newFarmerPackages[selectedPackage].balance = newBal;
          if (newBal >= Number(farmer.packages[selectedPackage].totalDue)) {
            packUpdate = { ...packUpdate, status: "complete" };
            newFarmerPackages[selectedPackage].status = "complete";
          }
          let updatedPack = await Packages.findByIdAndUpdate(
            farmer.packages[selectedPackage].packageID,
            packUpdate,
            {
              new: true,
              useFindAndModify: false,
            }
          );
          await Farmers.findByIdAndUpdate(
            farmer._id,
            { packages: newFarmerPackages },
            {
              new: true,
              useFindAndModify: false,
            }
          );
          const transaction = new Transactions({
            payee: {
              name: farmer.name,
              contact: farmer.contact,
              id: farmer._id,
            },
            package: updatedPack._id,
            amount: Number(doc.amount),
            reference: doc.cardNumber,
          });
          await transaction.save();
          let change = updatedPack.totalAmount - newBal;
          menu.end(
            "Payment was successful. You paid: UGX" +
              doc.amount +
              "." +
              "\nThe balance on the package is: UGX" +
              change +
              ".\nFor full transaction statement, visit the nearest branch office."
          );
        } else {
          menu.end("Invalid card number");
        }
      } catch (err) {
        console.error("USSD endScratch state error:", err);
        menu.end("An error occurred. Please try again later.");
      }
    },
  });

  menu.state("quit", {
    run: () => {
      menu.end("Goodbye :)");
    },
  });

  return menu;
}

exports.welcomeFarmer = async (req, res) => {
  const menu = createUssdMenu();
  let responded = false;
  menu.run(req.body, (ussdResult) => {
    if (responded) return;
    responded = true;
    res.send(ussdResult);
  });
};

// SMS functions remain unchanged
async function sendBulkSMS(recipients, message) {
  try {
    const sms = africastalking.SMS;
    const options = {
      to: recipients,
      message: message,
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
    let phoneNumber = contact.replace(/\D/g, "");
    if (phoneNumber.length > 0) {
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "+256" + phoneNumber.slice(1);
      }
      numbers.push(phoneNumber);
    }
  }
  return numbers;
}

async function extractSentPhoneNumbers(data) {
  const numbers = [];
  for (let i = 0; i < data.length; i++) {
    let phoneNumber = data[i].replace(/\D/g, "");
    if (phoneNumber.length > 0) {
      if (phoneNumber.startsWith("0")) {
        phoneNumber = "+256" + phoneNumber.slice(1);
      }
      numbers.push(phoneNumber);
    }
  }
  return numbers;
}

exports.sendMessages = async (req, res) => {
  const { message, selected, farmers } = req.body;
  //fetch recipients
  let recipients = [];
  if (selected === false) {
    Farmers.find()
      .then(async (data) => {
        //sort list of numbers
        recipients = await extractPhoneNumbers(data);
        // console.log(recipients)
        try {
          const response = await sendBulkSMS(recipients, message);
          res.json({ message: "Success", data: response });
        } catch (error) {
          res.status(500).json({ message: "Failed", data: null });
        }
      })
      .catch(() => {
        res.status(500).send({
          message: "Failed to fetch farmer contacts",
          data: null,
        });
      });
  } else {
    recipients = await extractSentPhoneNumbers(farmers);
    try {
      const response = await sendBulkSMS(recipients, message);
      res.json({ message: "Success", data: response });
    } catch (error) {
      res.status(500).json({ message: "Failed", data: null });
    }
  }
};
