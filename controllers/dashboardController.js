const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const moment = require('moment');

// Get main dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); // Fix: convert to ObjectId

        // Aggregate total income and expense
        const incomeAgg = await Transaction.aggregate([
            { $match: { user: userId, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expenseAgg = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const income = incomeAgg[0]?.total || 0;
        const expense = expenseAgg[0]?.total || 0;
        const balance = income - expense;

        // Category-wise spending
        const categoryBreakdown = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        // Recent transactions
        const recent = await Transaction.find({ user: userId })
            .sort({ date: -1 })
            .limit(5);

        res.json({
            income,
            expense,
            balance,
            categoryBreakdown,
            recent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Dashboard data fetch failed.' });
    }
};

// Get trends data for last 6 months
exports.getTrendsData = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id); // Fix: convert to ObjectId

        const sixMonthsAgo = moment().subtract(6, 'months').startOf('month').toDate();

        const trends = await Transaction.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $project: {
                    amount: 1,
                    type: 1,
                    month: { $dateToString: { format: "%Y-%m", date: "$date" } }
                }
            },
            {
                $group: {
                    _id: { month: "$month", type: "$type" },
                    total: { $sum: "$amount" }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    data: {
                        $push: {
                            type: "$_id.type",
                            total: "$total"
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const result = trends.map(monthEntry => {
            const income = monthEntry.data.find(d => d.type === "income")?.total || 0;
            const expense = monthEntry.data.find(d => d.type === "expense")?.total || 0;
            return {
                month: monthEntry._id,
                income,
                expense
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Trend data fetch failed" });
    }
};
