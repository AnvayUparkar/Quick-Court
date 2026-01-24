import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gray-50">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-4 text-center">Terms and Conditions</h1>
                <div className="prose prose-sm text-gray-700">
                    <p>
                        Welcome to Quick Court!<br />
                        By accessing or using this site, you agree to comply with the terms stated here.
                    </p>
                    <p>
                        This website is owned and operated by <strong>Anvay Mahesh Uparkar</strong>.
                    </p>
                    <p>
                        We reserve the right to modify or terminate the service at any time without prior notice.
                    </p>
                    <p>
                        All payments are securely processed through Razorpay.
                    </p>
                    <p>
                        For any queries, contact us at <a href="mailto:anvaymuparkar@gmail.com" className="text-indigo-600">anvaymuparkar@gmail.com</a> or call <a href="tel:9702017203" className="text-indigo-600">9702017203</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
