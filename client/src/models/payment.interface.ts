
export interface IPayment {
    _id: string;
    amount: number;
    mobile: number;
    method: string;
    status: string;
    transactionId?: string;
    userId: string;
    createdAt: string;
    updatedAt?: string;
    isBlocked?: boolean;
    totalAmount: number


}
