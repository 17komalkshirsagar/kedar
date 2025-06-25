


import React, { useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { useGetAllPaymentsQuery } from "../../redux/apis/payment.api";
import { useSendReceiptEmailMutation } from "../../redux/apis/emailSendReceipt.api";
const Receipt = ({ onClose }: { onClose?: () => void }) => {

    // const Receipt = () => {
    const { data } = useGetAllPaymentsQuery({})
    const printRef = useRef<HTMLDivElement>(null);

    // const handlePrint = () => {
    //     const printContents = printRef.current?.innerHTML;

    //     if (!printContents) return;

    //     const originalContents = document.body.innerHTML;
    //     document.body.innerHTML = printContents;
    //     window.print();
    //     document.body.innerHTML = originalContents;
    //     window.location.reload();
    // };

    const [sendReceiptEmail] = useSendReceiptEmailMutation();

    const handlePrint = async () => {
        const printContents = printRef.current?.innerHTML;

        if (!printContents) return;

        try {
            await sendReceiptEmail({
                to: (data?.result?.[0]?.customer as any)?.email || "komalkshirsagar32009@gmail.com",
                subject: `Receipt - बिल नं ${data?.result?.[0]?.billNumber ?? '-'}`,
                html: printContents,
                billNumber: data?.result?.[0]?.billNumber || '',
            }).unwrap();

            alert("📧 Receipt email sent successfully");
        } catch (error) {
            console.error("❌ Failed to send receipt email", error);
            alert("Failed to send email");
        }

        // Now print
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4">

            <div className="text-right flex justify-end gap-2">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 print:hidden"
                    >
                        Close
                    </button>
                )}

                <button
                    onClick={handlePrint}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 print:hidden"
                >
                    Print Receipt
                </button>
            </div>


            <div ref={printRef}>
                <Card className="p-4 border border-gray-300 rounded-lg shadow-md">
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="w-full md:w-1/6 flex justify-center md:justify-start">
                                <img
                                    src="https://cdn.pixabay.com/photo/2018/04/20/12/45/divinity-3335905_1280.png"
                                    alt="Lord Ganesha"
                                    className="w-32 h-32 object-contain rounded-md border border-gray-300 shadow-sm"
                                />
                            </div>


                            <Card className="w-full md:w-3/7 border border-gray-400 shadow">
                                <CardContent className="text-center py-4 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>कन्नड न्यायालय अंतर्गत</span>
                                        <span>कॅश क्रेडिट मेमो</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mt-2">केदार कृषी सेवा केंद्र</h2>
                                    <p className="text-sm text-gray-700">
                                        जनावरांच्या दवाखान्यासमोर, चाळीसगाव रोड, कन्नड
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        जि. छ. संभाजीनगर, मो. नं. ९४२०२३०४२५
                                    </p>
                                </CardContent>
                            </Card>

                            <CardContent className="w-full md:w-1/2 space-y-2">
                                <div className="border border-gray-300 px-2 py-2 text-sm bg-white text-gray-800 rounded-md">
                                    औषधी लॅ नं: LAID-15050447
                                </div>
                                <div className="border border-gray-300 px-2 py-2 text-sm bg-white text-gray-800 rounded-md">
                                    GST IN: 27CUUPK7153A1ZE
                                </div>
                                <div className="border border-gray-300 px-2 py-2 text-sm bg-white text-gray-800 rounded-md">
                                    बिल नं: {data?.result?.[0]?.billNumber ?? "-"}
                                </div>

                            </CardContent>
                        </div>

                        <hr className="my-2" />

                        <div className="flex text-sm text-gray-800 px-1 justify-between">
                            <span>श्री: {(data?.result?.[0]?.customer as any)?.name}</span>
                            <span>रा.: {(data?.result?.[0]?.customer as any)?.address}</span>

                            <span>दिनांक: {new Date().toLocaleDateString("hi-IN")}</span>
                        </div>

                        <hr className="my-2" />
                        <div>
                            <table className="w-full text-left border border-collapse border-gray-400">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-800">
                                        <th className="border border-gray-400 p-1">तपशील</th>
                                        <th className="border border-gray-400 p-1">उत्पादक</th>
                                        <th className="border border-gray-400 p-1">बॅच नं / लॉट नं</th>
                                        <th className="border border-gray-400 p-1">एक्स. डेट</th>
                                        <th className="border border-gray-400 p-1">पॅकिंग/वजन</th>
                                        <th className="border border-gray-400 p-1">नग</th>
                                        <th className="border border-gray-400 p-1">दर</th>
                                        <th className="border border-gray-400 p-1">रक्कम</th>
                                    </tr>
                                </thead>
                                {data?.result?.[0]?.products?.map((item: any, index: any) => (
                                    <tr key={item._id}>
                                        <td className="border border-gray-400 p-1">{item.product.name}</td>
                                        <td className="border border-gray-400 p-1">{item.product.category}</td>
                                        <td className="border border-gray-400 p-1">{item.product.batchNumber}</td>
                                        <td className="border border-gray-400 p-1">{new Date(item.product.expiryDate).toLocaleDateString("hi-IN")}</td>
                                        <td className="border border-gray-400 p-1">{item.product.unit}</td>
                                        <td className="border border-gray-400 p-1">{item.quantity}</td>
                                        <td className="border border-gray-400 p-1">{item.price}</td>
                                        <td className="border border-gray-400 p-1">{item.quantity * item.price}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={6} className="border border-gray-400 p-1 text-xs">
                                        Deceleration - the Central Goods and Services Tax Act.2017 MHA-GST Act 2017
                                    </td>
                                    <td className="border border-gray-400 p-1 text-right font-semibold">एकूण</td>
                                    <td className="border border-gray-400 p-1 font-semibold">{data?.result?.[0]?.totalAmount}/-</td>
                                </tr>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                            <strong className="text-red-600">टीप:</strong>
                            <p>1️⃣ एकदा विकलेला माल परत घेतला जाणार नाही.</p>
                            <p>2️⃣ 'वरली सर्व' हे औषध विषारी असून केवळ शेती उपयोगासाठीच आहे.</p>

                            <div className="flex flex-wrap justify-between gap-4 mt-4 font-semibold">
                                <span>3️⃣ हलगर्जीपणामुळे झालेल्या नुकसानीस आम्ही जबाबदार राहणार नाही.</span>
                                <span>धन्यवाद.....</span>
                                <span>माल घेणाराची सही</span>
                                <span>करिता केदार कृषी सेवा केंद्र</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Receipt;
