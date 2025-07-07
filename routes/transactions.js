const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/authMiddleware');

// CREATE transaction
router.post('/', auth, async (req, res) => {
    try {
        const transaction = new Transaction({ ...req.body, user: req.user.id });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Error creating transaction' });
    }
});

// READ all transactions
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// UPDATE transaction
router.put('/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Error updating transaction' });
    }
});

// DELETE transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting transaction' });
    }
});

module.exports = router;
