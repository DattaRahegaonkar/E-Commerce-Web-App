const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    transactionId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentGateway: {
        type: String,
        default: null // e.g., 'razorpay', 'stripe', etc.
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Indexes for better query performance
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1, paymentDate: -1 });
PaymentSchema.index({ status: 1 });

// Generate transaction ID for online payments
PaymentSchema.pre('save', function(next) {
    if (this.paymentMethod === 'online' && !this.transactionId) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        this.transactionId = `TXN-${timestamp}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Payment', PaymentSchema);