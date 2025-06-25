import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../utils/email";
import { ReceiptEmail } from "../models/ReceiptEmail";
import { invalidateCache } from "../utils/redisMiddleware";

export const sendReceiptEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { to, subject, html, billNumber } = req.body;

    if (!to || !subject || !html) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }


    await sendEmail({ to, subject, text: html, html });


    await ReceiptEmail.create({
        customerEmail: to,
        subject,
        html,
        billNumber,
        status: "sent",
    });

    invalidateCache("receiptemail:*");

    res.status(200).json({ success: true, message: "Receipt email sent and logged" });
});
