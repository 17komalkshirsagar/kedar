// import React, { useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { toast } from 'sonner';
// import { useNavigate, useParams } from 'react-router-dom';

// import { Input } from '../../components/ui/input';
// import { Button } from '../../components/ui/button';
// import { Label } from '../../components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// import { Textarea } from '../../components/ui/textarea';
// import { Icons } from '../../components/ui/icons';

// import {
//     useCreateNotificationLogMutation,
//     useGetNotificationLogByIdQuery,
//     useUpdateNotificationLogMutation,
// } from '../../redux/apis/notificationLog.api';
// import { useGetAllCustomersQuery } from '../../redux/apis/customer.api';
// import { useGetAllPaymentsQuery } from '../../redux/apis/payment.api';



// const schema = z.object({
//     customer: z.string().min(1, 'Customer is required'),
//     type: z.enum(['email', 'whatsapp'], { required_error: 'Type is required' }),
//     message: z.string().optional(),
//     payment: z.string().optional(),
//     status: z.enum(['Sent', 'Failed'], { required_error: 'Status is required' }),
// });

// type NotificationFormData = z.infer<typeof schema>;

// const NotificationPage = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const {
//         register,
//         handleSubmit,
//         reset,
//         formState: { errors },
//     } = useForm<NotificationFormData>({
//         resolver: zodResolver(schema),
//         defaultValues: {
//             customer: '',
//             type: 'email',
//             message: '',
//             payment: '',
//             status: 'Sent',
//         },
//     });

//     const [createNotification] = useCreateNotificationLogMutation();
//     const [updateNotification] = useUpdateNotificationLogMutation();
//     const { data: notificationData } = useGetNotificationLogByIdQuery(id!, { skip: !id });
//     const { data: customers } = useGetAllCustomersQuery({});
//     const { data: paymentData } = useGetAllPaymentsQuery({})

//     console.log("customers:::", customers);

//     useEffect(() => {
//         if (id && notificationData) {
//             reset({
//                 customer: notificationData.customer,
//                 type: notificationData.type as 'email' | 'whatsapp',
//                 message: notificationData.message || '',
//                 payment: notificationData.payment || '',
//                 status: notificationData.status as 'Sent' | 'Failed',
//             });
//         }
//     }, [id, notificationData, reset]);


//     const onSubmit = async (data: NotificationFormData) => {
//         try {
//             if (id) {
//                 await updateNotification({ id, data });
//                 toast.success('Notification updated');
//             } else {
//                 await createNotification(data);
//                 toast.success('Notification sent');
//             }
//             navigate('/notification-table');
//         } catch (error) {
//             toast.error('Something went wrong');
//         }
//     };

//     return (
//         <div className="max-w-3xl mx-auto py-8">
//             <Card>
//                 <CardHeader className="flex items-center justify-center">
//                     <Icons.mail className="h-10 w-10 text-blue-600 mb-2" />
//                     <CardTitle>{id ? 'Update Notification' : 'Send Notification'}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                         {/* Customer & Type Side-by-side */}
//                         <div className="flex flex-wrap gap-4">
//                             <div className="flex-1 min-w-[200px]">
//                                 <Label htmlFor="customer">Customer</Label>
//                                 <select id="customer" {...register('customer')} className="w-full border rounded px-3 py-2">
//                                     <option value="">Select customer</option>
//                                     {customers && customers.result.map((cust: any) => (
//                                         <option key={cust._id} value={cust._id}>
//                                             {cust.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.customer && <p className="text-red-500 text-sm">{errors.customer.message}</p>}
//                             </div>

//                             <div className="flex-1 min-w-[200px]">
//                                 <Label htmlFor="type">Type</Label>
//                                 <select id="type" {...register('type')} className="w-full border rounded px-3 py-2">
//                                     <option value="email">Email</option>
//                                     <option value="whatsapp">WhatsApp</option>
//                                 </select>
//                                 {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
//                             </div>
//                         </div>

//                         {/* Message */}
//                         <div>
//                             <Label htmlFor="message">Message</Label>
//                             <Textarea id="message" rows={4} {...register('message')} />
//                         </div>

//                         <div className="flex flex-wrap gap-4 mt-4">
//                             <div className="flex-1 min-w-[200px]">
//                                 <Label htmlFor="payment">Payment</Label>
//                                 <select id="payment" {...register('payment')} className="w-full border rounded px-3 py-2">
//                                     <option value="">Select payment (optional)</option>
//                                     {paymentData && paymentData?.result.map((pay) => (
//                                         <option key={pay._id} value={pay._id}>
//                                             Payment {pay._id}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="flex-1 min-w-[200px]">
//                                 <Label htmlFor="status">Status</Label>
//                                 <select id="status" {...register('status')} className="w-full border rounded px-3 py-2">
//                                     <option value="Sent">Sent</option>
//                                     <option value="Failed">Failed</option>
//                                 </select>
//                                 {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
//                             </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex justify-end gap-3 pt-4">
//                             <Button type="button" className="bg-red-700" variant="outline" onClick={() => reset()}>
//                                 Cancel
//                             </Button>
//                             <Button className="bg-green-700" type="submit">
//                                 {id ? 'Update' : 'Send'}
//                             </Button>
//                         </div>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default NotificationPage;
import React, { useState } from 'react';

import { toast } from 'sonner';
import { useGetAllCustomersQuery } from '../../redux/apis/customer.api';
import { useGetCustomerPaymentHistoryQuery, useGetCustomerPaymentSummaryQuery } from '../../redux/apis/payment.api';
import { useSendReminderMutation } from '../../redux/apis/notificationLog.api';

const NotificationPage = () => {
    const { data: allCustomersData, isLoading } = useGetAllCustomersQuery();
    const { data: paymentSummary } = useGetCustomerPaymentSummaryQuery();
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const { data: historyData } = useGetCustomerPaymentHistoryQuery(selectedCustomerId, {
        skip: !selectedCustomerId,
    });

    const [sendReminder] = useSendReminderMutation();

    const handleSendReminder = async (customerId) => {
        try {
            await sendReminder({ customerId }).unwrap();
            toast.success('Reminder sent!');
        } catch (error) {
            toast.error('Failed to send reminder');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">✅ Main Customer Reminder Table</h2>
            <table className="min-w-full bg-white shadow rounded border">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Product Name</th>
                        <th className="px-4 py-2">Amount Due</th>
                        <th className="px-4 py-2">Last Reminder</th>
                        <th className="px-4 py-2">WhatsApp</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Send Reminder</th>
                    </tr>
                </thead>
                <tbody>
                    {allCustomersData?.result?.map((customer) => {
                        const summary = paymentSummary?.result?.find(
                            (entry) => entry.customerId === customer._id
                        );

                        return (
                            <tr key={customer._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2 text-blue-600 cursor-pointer" onClick={() => setSelectedCustomerId(customer._id)}>
                                    {customer.name}
                                </td>
                                <td className="px-4 py-2">{summary?.productName || '—'}</td>
                                <td className="px-4 py-2">₹{summary?.amountDue || '0'}</td>
                                <td className="px-4 py-2">{summary?.lastReminder || '-'}</td>
                                <td className="px-4 py-2 text-center">{summary?.whatsappSent ? '☑️' : '☐'}</td>
                                <td className="px-4 py-2 text-center">{summary?.emailSent ? '☑️' : '☐'}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        onClick={() => handleSendReminder(customer._id)}
                                    >
                                        🔘 Send
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Payment History Modal */}
            {selectedCustomerId && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 z-50">
                    <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl shadow-lg relative">
                        <button
                            className="absolute top-2 right-3 text-gray-600 hover:text-black"
                            onClick={() => setSelectedCustomerId(null)}
                        >
                            ✖
                        </button>
                        <h3 className="text-lg font-bold mb-4">
                            🔍 {allCustomersData?.result?.find(c => c._id === selectedCustomerId)?.name} – Payment History
                        </h3>

                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">Product Name</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">WhatsApp</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Reminder Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData?.result?.map((payment) => (
                                    <tr key={payment._id} className="border-t">
                                        <td className="px-4 py-2">{payment.productName}</td>
                                        <td className="px-4 py-2">₹{payment.amount}</td>
                                        <td className="px-4 py-2">{payment.date}</td>
                                        <td className="px-4 py-2 text-center">{payment.whatsappSent ? '☑️' : '☐'}</td>
                                        <td className="px-4 py-2 text-center">{payment.emailSent ? '☑️' : '☐'}</td>
                                        <td className="px-4 py-2">{payment.reminderStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
