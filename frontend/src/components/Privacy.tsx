import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Privacy Policy</h1>
        <div className="prose prose-sm text-gray-700">
          <p>
            Your privacy is important to us.
          </p>
          <p>
            We collect minimal information such as name, email, and payment details only for transaction processing.
          </p>
          <p>
            We never sell, share, or misuse user data.
          </p>
          <p>
            All payments are securely handled via Razorpay on behalf of <strong>Anvay Mahesh Uparkar</strong>.
          </p>
          <p>
            If you have any privacy concerns, contact us at <a href="mailto:anvaymuparkar@gmail.com" className="text-indigo-600">anvaymuparkar@gmail.com</a> or call <a href="tel:9702017203" className="text-indigo-600">9702017203</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
