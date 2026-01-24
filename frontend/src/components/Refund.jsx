import React from 'react';

const Refund = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gray-50">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-4 text-center">Return / Refund / Cancellation Policy</h1>
                <div className="prose prose-sm text-gray-700">
                    <p>
                        We strive to provide the best experience for our users.
                    </p>
                    <p>
                        Refunds for accidental or failed transactions will be processed within <strong>5–7 business days</strong>.
                    </p>
                    <p>
                        For cancellations or refund requests, please email <a href="mailto:anvaymuparkar@gmail.com" className="text-indigo-600">anvaymuparkar@gmail.com</a> or call <a href="tel:9702017203" className="text-indigo-600">9702017203</a>.
                    </p>
                    <p>
                        All payments are securely managed through Razorpay.
                    </p>
                    <p>
                        Thank you for choosing Quick Court, operated by <strong>Anvay Mahesh Uparkar</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Refund;
