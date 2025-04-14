const db = require("../models/index");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Credit = db.Credit;

/**
 * Add a new credit record.
 */
exports.addCredit = async (req, res) => {
    const { name, address, amount, paymentPeriod, interestRate, creditType, status } = req.body;

    if (!(name && address && amount && paymentPeriod && interestRate && creditType && status)) {
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        const credit = new Credit({
            name,
            address,
            amount,
            paymentPeriod,
            interestRate,
            creditType,
            status: 'pending',
        });

        const data = await credit.save();
        res.status(201).send({ message: "Credit record added successfully.", data });
    } catch (error) {
        console.error("Error adding credit:", error);
        res.status(500).send({ message: "An error occurred while adding the credit record." });
    }
};

/**
 * Retrieve a single credit record by ID.
 */
exports.getCreditById = async (req, res) => {
    const { id } = req.params;

    try {
        const credit = await Credit.findById(id);

        if (!credit) {
            return res.status(404).send({ message: "Credit record not found." });
        }

        res.status(200).send({ message: "Credit retrieved successfully.", data: credit });
    } catch (error) {
        console.error("Error retrieving credit:", error);
        res.status(500).send({ message: "An error occurred while retrieving the credit." });
    }
};

/**
 * Retrieve all credit records.
 */
exports.getAllCredits = async (req, res) => {
    try {
        const credits = await Credit.find();

        res.status(200).send({ message: "Credits retrieved successfully.", data: credits });
    } catch (error) {
        console.error("Error retrieving credits:", error);
        res.status(500).send({ message: "An error occurred while retrieving credits." });
    }
};

/**
 * Update a credit record by ID.
 */
exports.updateCredit = async (req, res) => {
    const { id } = req.params;
    const { name, address, amount, paymentPeriod, interestRate, creditType, status } = req.body;

    try {
        const credit = await Credit.findById(id);

        if (!credit) {
            return res.status(404).send({ message: "Credit record not found." });
        }

        // Update fields if provided
        credit.name = name || credit.name;
        credit.address = address || credit.address;
        credit.amount = amount || credit.amount;
        credit.paymentPeriod = paymentPeriod || credit.paymentPeriod;
        credit.interestRate = interestRate || credit.interestRate;
        credit.creditType = creditType || credit.creditType;
        credit.status = status || credit.status;

        const updatedCredit = await credit.save();
        res.status(200).send({ message: "Credit updated successfully.", data: updatedCredit });
    } catch (error) {
        console.error("Error updating credit:", error);
        res.status(500).send({ message: "An error occurred while updating the credit." });
    }
};

/**
 * Delete a credit record by ID.
 */
exports.deleteCredit = async (req, res) => {
    const { id } = req.params;

    try {
        const credit = await Credit.findById(id);

        if (!credit) {
            return res.status(404).send({ message: "Credit record not found." });
        }

        await Credit.deleteOne({ _id: id });
        res.status(200).send({ message: "Credit deleted successfully." });
    } catch (error) {
        console.error("Error deleting credit:", error);
        res.status(500).send({ message: "An error occurred while deleting the credit." });
    }
};

/**
 * Search credit records by name or address.
 */
exports.searchCredits = async (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).send({ message: "Search keyword is required." });
    }

    try {
        const credits = await Credit.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { address: { $regex: keyword, $options: "i" } },
            ],
        });

        if (credits.length === 0) {
            return res.status(404).send({ message: "No credits found matching the keyword." });
        }

        res.status(200).send({ message: "Credits retrieved successfully.", data: credits });
    } catch (error) {
        console.error("Error searching credits:", error);
        res.status(500).send({ message: "An error occurred while searching credits." });
    }
};
