const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

// GET /api/investments - Get investment suggestions based on balance
router.get('/', auth, async (req, res) => {
    try {
        // Fetch all transactions for the authenticated user
        const transactions = await Transaction.find({ user: req.user.id });

        // Calculate current balance
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        // Generate investment suggestions based on balance
        let suggestions = [];
        let riskLevel = '';

        if (balance < 0) {
            riskLevel = 'Critical';
            suggestions = [
                "Focus on debt reduction before investing",
                "Create a strict budget to improve cash flow",
                "Consider additional income sources",
                "Avoid all investment risks until balance is positive"
            ];
        } else if (balance < 1000) {
            riskLevel = 'Conservative';
            suggestions = [
                "Build an emergency fund first (3-6 months expenses)",
                "Start with a high-yield savings account",
                "Consider opening a recurring deposit",
                "Focus on increasing income and reducing expenses"
            ];
        } else if (balance < 5000) {
            riskLevel = 'Moderate';
            suggestions = [
                "Start SIP in large-cap mutual funds",
                "Consider liquid funds for emergency money",
                "Look into government bonds or FDs",
                "Begin with low-risk debt mutual funds"
            ];
        } else if (balance < 20000) {
            riskLevel = 'Balanced';
            suggestions = [
                "Diversify with equity and debt mutual funds",
                "Consider ELSS funds for tax benefits",
                "Explore index funds and ETFs",
                "Start investing in blue-chip stocks"
            ];
        } else {
            riskLevel = 'Aggressive';
            suggestions = [
                "Diversify across multiple asset classes",
                "Consider mid-cap and small-cap funds",
                "Explore international mutual funds",
                "Look into real estate investment trusts (REITs)",
                "Consider direct equity investments"
            ];
        }

        res.json({
            balance,
            riskLevel,
            suggestions,
            message: "Investment suggestions generated successfully"
        });

    } catch (err) {
        console.error('Error fetching investment suggestions:', err);
        res.status(500).json({
            message: 'Error fetching investment suggestions',
            error: err.message
        });
    }
});

module.exports = router;