const db = require("../models/index");
const dbConfig = require("../../config/dbconfig.js");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const emailService = require("../../services/emailService");

const Users = db.Users;
const Counters = db.Counters;
const Farmers = db.Farmers;

exports.addFarmer = async (req, res) => {
  const { name, contact, adderID, farmProducts, location, gender } = req.body;
  if (!(name && contact && adderID && farmProducts && location)) {
    return res.status(400).send({ message: "All input is required" });
  }
  Farmers.findOne({ contact: contact })
    .then(async (data) => {
      if (data !== null) {
        // Return existing farmer data instead of error for better sync compatibility
        return res.status(200).send({
          message: "Farmer with this contact already exists",
          data: data,
          isExisting: true,
        });
      }
      var num;
      var collectionExists = await Counters.findById(
        dbConfig.counterCollection
      );
      if (collectionExists == null) {
        const count = new Counters({
          _id: new ObjectId(dbConfig.counterCollection),
          farmers: 1,
          products: 0,
          packages: 0,
        });
        var counts = await count.save(count);
        num = counts.farmers;
      } else {
        try {
          let doc = await Counters.findByIdAndUpdate(
            dbConfig.counterCollection.toString(),
            { $inc: { farmers: 1 } },
            { new: true, useFindAndModify: false }
          );
          if (doc) {
            num = doc.farmers;
          }
        } catch (err) {
          res.status(500).send({ message: "failed to add user" });
          return;
        }
      }

      if (typeof num === "number" || !num) {
        const farmer = new Farmers({
          name: name,
          contact: contact,
          adderID: adderID,
          number: num,
          farmProducts: farmProducts,
          location: location,
          gender: gender,
          packages: [],
        });

        farmer
          .save(farmer)
          .then((data) => {
            res.status(201).send({
              message: "success",
              data,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: error.message,
            });
          });
      } else {
        res.status(502).send({ message: "Failed to save farmer" });
        return;
      }
    })
    .catch((e) => {
      res.status(500).send({
        message: e.message,
      });
    });
};

exports.getFarmer = async (req, res) => {
  const id = req.params.id;
  Farmers.findById(id)
    .then((data) => {
      if (data !== null) {
        res.status(200).send({ message: "success", data: data });
      } else {
        res.status(404).send({ message: "no farmer retrieved", data: null });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "error, can't retrieve data",
      });
    });
};

exports.getAllFarmers = async (req, res) => {
  Farmers.find()
    .then((data) => {
      res.status(200).json({
        message: "success",
        data: data,
      });
    })
    .catch(() => {
      res.status(500).send({
        message: "failed",
      });
    });
};
exports.deleteFarmer = async (req, res) => {
  const id = req.params.id;
  try {
    // Get farmer details before deletion
    const farmer = await Farmers.findById(ObjectId(id));
    if (!farmer) {
      return res.status(404).send({ message: "Farmer not found" });
    }

    // Get admin user info from auth middleware
    // req.userData is set by auth middleware, fallback to finding by decoded token
    let adminUser = req.userData;

    if (!adminUser && req.user && req.user.user_id) {
      try {
        adminUser = await Users.findById(req.user.user_id);
      } catch (err) {
        console.error("Error fetching admin user:", err);
      }
    }

    // Delete the farmer
    await Farmers.deleteOne({ _id: ObjectId(id) });

    // Send deletion notification to all admins (async, don't wait)
    try {
      const allAdmins = await Users.find({ role: "admin" }).select(
        "email name"
      );
      const adminEmails = allAdmins.map((admin) => admin.email).filter(Boolean);

      if (adminEmails.length > 0) {
        emailService.sendDeletionNotificationEmail(adminEmails, {
          adminEmail: adminUser?.email || "Unknown",
          adminName: adminUser?.name || adminUser?.email || "Unknown Admin",
          deletionType: "Farmer",
          deletedItemName: farmer.name,
          deletedItemId: id,
          timestamp: new Date(),
        });
      }
    } catch (emailError) {
      console.error("Failed to send deletion notification:", emailError);
      // Don't fail the deletion if email fails
    }

    res.status(200).send({
      message: "deleted farmer successfully",
    });
  } catch (e) {
    res.status(500).send({
      message: "failed to delete farmer",
    });
  }
};

exports.editFarmer = async (req, res) => {
  const id = req.params.id;
  const { name, contact, location, gender, farmProducts } = req.body;

  // Validate required fields
  if (!id) {
    return res.status(400).send({ message: "Farmer ID is required" });
  }

  try {
    // Check if farmer exists
    const existingFarmer = await Farmers.findById(id);
    if (!existingFarmer) {
      return res.status(404).send({ message: "Farmer not found" });
    }

    // Check if contact is being changed and if new contact already exists
    if (contact && contact !== existingFarmer.contact) {
      const contactExists = await Farmers.findOne({
        contact,
        _id: { $ne: id },
      });
      if (contactExists) {
        return res
          .status(409)
          .send({ message: "Contact already exists for another farmer" });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;
    if (location) updateData.location = location;
    if (gender) updateData.gender = gender;
    if (farmProducts) updateData.farmProducts = farmProducts;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // Update the farmer
    const updatedFarmer = await Farmers.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (updatedFarmer) {
      res.status(200).send({
        message: "Farmer updated successfully",
        data: updatedFarmer,
      });
    } else {
      res.status(500).send({ message: "Failed to update farmer" });
    }
  } catch (error) {
    console.error("Error updating farmer:", error);
    res.status(500).send({
      message: "An error occurred while updating the farmer",
      error: error.message,
    });
  }
};

exports.searchkey = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "No body syntax from the request" });
    return;
  }

  if (req.body.word) {
    var filter = [
      {
        $search: {
          index: "default",
          text: {
            path: ["name", "contact"],
            query: req.body.word,
          },
        },
      },
      { $limit: 10 },
    ];
    // Books.index( { title: "text", author: "text" ,category:"text"} );
    Farmers.aggregate(filter)
      .then((data) => {
        // console.log(req.body.word, data);
        if (data.length > 0) {
          res.status(200).send({ message: "success", data });
        } else {
          res.status(200).send({ message: "no farmers found" });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving farmers.",
        });
      });
  } else {
    res
      .status(401)
      .send({ text: "failed", msg: "no word given", result: null });
    return;
  }
};

exports.getFarmerByContact = async (req, res) => {
  try {
    const { contact } = req.params;

    if (!contact) {
      return res.status(400).send({ message: "Contact is required" });
    }

    const farmer = await Farmers.findOne({ contact });

    if (farmer) {
      return res.status(200).json({ message: "Farmer found", data: farmer });
    } else {
      return res
        .status(404)
        .send({ message: "No Farmer found with the provided contact" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "An error occurred", error: err.message });
  }
};

exports.getFarmersByAdderID = async (req, res) => {
  const { adderID } = req.params;

  if (!adderID) {
    return res.status(400).send({ message: "Adder ID is required" });
  }

  try {
    const farmers = await Farmers.find({ adderID });

    // Ensure packages field is properly included (it should be by default, but let's be explicit)
    const farmersWithPackages = farmers.map((farmer) => ({
      ...farmer.toObject(),
      packages: farmer.packages || [], // Ensure packages array is always present
    }));

    // Always return 200 with consistent structure
    return res.status(200).send({
      message:
        farmers.length > 0
          ? "Farmers retrieved successfully"
          : "No farmers found for the specified adder ID",
      data: farmersWithPackages, // Return farmers with explicit package data
      count: farmers.length,
    });
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while retrieving farmers",
      error: error.message,
      data: null,
    });
  }
};
