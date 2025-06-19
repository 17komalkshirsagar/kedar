import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentProduct {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IPayment extends Document {
    customer: mongoose.Types.ObjectId;
    products: IPaymentProduct[];
    totalAmount: number;
    paidAmount: number;
    pendingAmount?: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit' | 'Other';
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
    paymentReference?: string | null;
    isDeleted: boolean;
    isBlock: boolean;
    status: 'active' | 'inactive';
    createdAt?: Date;
    updatedAt?: Date;
}
const PaymentSchema: Schema<IPayment> = new Schema(
    {
        customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },

        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],

        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        pendingAmount: { type: Number },

        paymentMode: {
            type: String,
            enum: ['Cash', 'UPI', 'Bank Transfer', 'Credit', 'Other'],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Partial'],
            default: 'Unpaid',
        },

        paymentReference: { type: String, default: null },

        isDeleted: { type: Boolean, default: false },

        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        isBlock: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Pre-save hook for calculating pendingAmount and paymentStatus
PaymentSchema.pre<IPayment>('save', function (next) {
    this.pendingAmount = this.totalAmount - this.paidAmount;
    if (this.pendingAmount <= 0) this.paymentStatus = 'Paid';
    else if (this.paidAmount === 0) this.paymentStatus = 'Unpaid';
    else this.paymentStatus = 'Partial';
    next();
});




export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);