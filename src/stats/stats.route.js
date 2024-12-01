// Import required modules and initialize router
const express = require('express');
const User = require('../users/user.model');
const Order = require('../orders/orders.model');
const Reviews = require('../reviews/reviews.model');
const Products = require('../products/products.model');
const router = express.Router();

// Get user statistics by email
router.get('/user-stats/:email', async (req, res) => {
    const { email } = req.params; // Extract email from request
    if (!email) {
        return res.status(400).send({ message: 'Email is required' }); // Email is mandatory
    }
    try {
        const user = await User.findOne({ email: email }); // Find user by email
        if (!user) return res.status(404).send({ message: 'User not found' });

        // Calculate total payments
        const totalPaymentsResult = await Order.aggregate([
            { $match: { email: email } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalPaymentsAmmount = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;

        // Count total reviews
        const totalReviews = await Reviews.countDocuments({ userId: user._id });

        // Count unique purchased products
        const purchasedProductIds = await Order.distinct("products.productId", { email: email });
        const totalPurchasedProducts = purchasedProductIds.length;

        // Send user statistics
        res.status(200).send({
            totalPayments: totalPaymentsAmmount.toFixed(2),
            totalReviews,
            totalPurchasedProducts
        });
    } catch (error) {
        console.error("Error fetching user stats", error);
        res.status(500).send({ message: 'Failed to fetch user stats' });
    }
});

// Get admin statistics
router.get('/admin-stats', async (req, res) => {
    try {
        // Count total orders, products, reviews, and users
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Products.countDocuments();
        const totalReviews = await Reviews.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total earnings
        const totalEarningsResult = await Order.aggregate([
            { $group: { _id: null, totalEarnings: { $sum: "$amount" } } }
        ]);
        const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalEarnings : 0;

        // Calculate monthly earnings
        const monthlyEarningsResult = await Order.aggregate([
            { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, monthlyEarnings: { $sum: "$amount" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort by year and month
        ]);

        // Format monthly earnings for easier frontend usage
        const monthlyEarnings = monthlyEarningsResult.map(entry => ({
            month: entry._id.month,
            year: entry._id.year,
            earnings: entry.monthlyEarnings,
        }));

        // Send admin statistics
        res.status(200).json({
            totalOrders,
            totalProducts,
            totalReviews,
            totalUsers,
            totalEarnings,
            monthlyEarnings
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
});

module.exports = router;
