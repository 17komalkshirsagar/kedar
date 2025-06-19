import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { customValidator } from "../utils/validator";
import redisClient from "../services/redisClient";
import { invalidateCache } from "../utils/redisMiddleware";
import { Payment } from "../models/payment";
import { createPaymentRules } from "../rules/payment.rules";
import { Product } from "../models/product";

// Create Payment
// export const createPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     const data = req.body;
//     // const { isError, error } = customValidator(data, createPaymentRules);

//     // if (isError) return res.status(422).json({ message: "Validation Error", error });

//     const result = await Payment.create(data);
//     invalidateCache("payments:*");
//     res.status(200).json({ message: "Payment created successfully", result });
// });


export const createPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const data = req.body;

    for (const item of data.products) {
        const product = await Product.findById(item.product);
        if (!product) {
            return res.status(409).json({ error: `Product not found` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
        }
        product.stock -= item.quantity;
        await product.save();
    }

    const result = await Payment.create(data);
    invalidateCache("payments:*");

    res.status(200).json({ message: "Payment created successfully", result });
});

// Get All Payments
export const getPayments = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", paymentStatus, paymentMode } = req.query;

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()));
    const cacheKey = `payments:${sortedQuery}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) return res.status(200).json(JSON.parse(cachedData));

    const currentPage = parseInt(page as string);
    const pageLimit = parseInt(limit as string);
    const skip = (currentPage - 1) * pageLimit;

    const query: any = {
        isDeleted: false,
        ...(req.query.isBlock !== undefined && { isBlock: req.query.isBlock === "true" }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMode && { paymentMode }),
        ...(searchQuery
            ? {
                $or: [
                    { paymentReference: { $regex: searchQuery, $options: "i" } },
                    // Add additional searchable fields here
                ],
            }
            : {}),
    };

    const totalEntries = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalEntries / pageLimit);

    const result = await Payment.find(query)
        .populate("customer products.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean();

    const pagination = { page: currentPage, limit: pageLimit, totalEntries, totalPages };

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "Payments fetched successfully", result, pagination })
    );

    res.status(200).json({ message: "Payments fetched successfully", result, pagination });
});

// Get Payment by ID
export const getPaymentById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const cacheKey = `payment:${id}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) return res.status(200).json(JSON.parse(cachedData));

    const result = await Payment.findById(id).populate("customer products.product").lean();
    if (!result || result.isDeleted) return res.status(409).json({ message: "Payment not found" });

    await redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "Payment fetched successfully", result }));
    res.status(200).json({ message: "Payment fetched successfully", result });
});

// Update Payment
export const updatePayment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment || payment.isDeleted) return res.status(409).json({ message: "Payment not found" });
    if (payment.isBlock) return res.status(403).json({ message: "Payment is blocked and cannot be updated" });

    const result = await Payment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    invalidateCache(`payment:${id}`);
    invalidateCache("payments:*");
    res.status(200).json({ message: "Payment updated successfully", result });
});

// Delete Payment (Soft)
export const deletePayment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment || payment.isDeleted) return res.status(409).json({ message: "Payment not found" });


    const result = await Payment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    invalidateCache(`payment:${id}`);
    invalidateCache("payments:*");
    res.status(200).json({ message: "Payment deleted successfully", result });
});

// Update Payment Status
export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { status } = req.body;
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment || payment.isDeleted) return res.status(409).json({ message: "Payment not found" });


    const result = await Payment.findByIdAndUpdate(id, { paymentStatus: status }, { new: true });
    invalidateCache(`payment:${id}`);
    invalidateCache("payments:*");
    res.status(200).json({ message: "Payment status updated successfully", result });
});

// Block / Unblock Payment



export const blockPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment || payment.isDeleted) {
        return res.status(409).json({ message: "payment not found" });
    }

    const result = await Payment.findByIdAndUpdate(id, { isBlock: true }, { new: true });

    invalidateCache(`payment:${id}`);
    invalidateCache("payments:*");
    res.status(200).json({ message: "payment blocked successfully", result });
});



export const getCustomerPaymentSummary = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const result = await Payment.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: "$customer",
                totalAmount: { $sum: "$totalAmount" },
                paidAmount: { $sum: "$paidAmount" },
                remainingAmount: {
                    $sum: { $subtract: ["$totalAmount", "$paidAmount"] },
                },
            },
        },
        {
            $lookup: {
                from: "customers",
                localField: "_id",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: "$customer" },
        {
            $project: {
                _id: 0,
                customerId: "$customer._id",
                name: "$customer.name",
                email: "$customer.email",
                mobile: "$customer.mobile",
                totalAmount: 1,
                paidAmount: 1,
                remainingAmount: 1,
            },
        },
    ]);

    res.status(200).json({ message: "payment Customer Payment Summary successfully", result });
});



export const getCustomerPaymentHistory = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const { customerId } = req.params;

    const result = await Payment.find({
        customer: customerId,
        isDeleted: false,
    })
        .populate("products.product", "name")
        .sort({ createdAt: -1 });
    res.status(200).json({ message: "payment customer payment history successfully", result });
});
