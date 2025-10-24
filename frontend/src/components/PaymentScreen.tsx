import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../contexts/DataContext';
import { useContext } from 'react';
import type { DataContextType } from '../contexts/DataContext';
import { CheckCircleIcon, CreditCardIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import Loader from './shared/Loader';

// Add Razorpay type declarations at the top level
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}


const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dataContext = useContext(DataContext) as DataContextType;
  const { createBooking, courts } = dataContext;

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      navigate('/courts');
    }
  }, [navigate]);

  // Create Razorpay order via backend and open checkout
  const createOrderAndOpenRazorpay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: bookingData.totalPrice,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create payment order');
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }
      
      const order = data.order;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: bookingData.totalPrice * 100,
        currency: 'INR',
        name: bookingData.venue,
        description: 'Court Booking Payment',
        order_id: order.id,
        handler: function(response: RazorpayResponse) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: bookingData.name || '',
          email: bookingData.email || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/razorpay/verify-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          bookingPayload: bookingData,
        }),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        // After successful payment verification, create the booking in the backend
        const selectedCourtObj = courts.find((c: any) => c.name === bookingData.court && c.facilityId === (bookingData.venueId || bookingData.facilityId));
        if (!selectedCourtObj) {
          alert('Selected court not found during booking creation.');
          setProcessing(false);
          return;
        }
        const payload = {
          facilityId: bookingData.venueId || bookingData.facilityId,
          courtId: selectedCourtObj._id,
          date: new Date(bookingData.date).toISOString(),
          timeSlot: bookingData.time,
        };
        await createBooking(payload);

        setShowSuccess(true);
        sessionStorage.removeItem('bookingData');
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (err) {
      alert('Payment verification error.');
    }
  };

  // Load Razorpay script and initiate payment
  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => createOrderAndOpenRazorpay();
    } else {
      createOrderAndOpenRazorpay();
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Find the actual court object by name (from bookingData.court)
  const selectedCourtObj = courts.find((c: any) => c.name === bookingData.court && c.facilityId === (bookingData.venueId || bookingData.facilityId));
      if (!selectedCourtObj) {
        alert('Selected court not found.');
        setProcessing(false);
        return;
      }
      const payload = {
        facilityId: bookingData.venueId || bookingData.facilityId,
        courtId: selectedCourtObj._id,
        date: new Date(bookingData.date).toISOString(),
        timeSlot: bookingData.time,
      };
  await createBooking(payload);
  sessionStorage.removeItem('bookingData');
  setShowSuccess(true);
    } catch (err) {
      alert('Booking failed. Please try again.');
    }
    setProcessing(false);
  };

  if (!bookingData) {
  return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Header /> Removed local Header component */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
              <p className="mb-6">Your booking has been confirmed. You will be redirected to your dashboard.</p>
              <button
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700"
                onClick={() => navigate('/')}
              >
                OK
              </button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Confirm Booking & Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sport Type:</span>
                <span className="font-medium text-gray-900">{bookingData.sport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium text-gray-900">{bookingData.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{bookingData.duration} hour(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Court:</span>
                <span className="font-medium text-gray-900">{bookingData.court}</span>
              </div>
            </div>

            <hr className="my-6" />
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price ({bookingData.duration}hr):</span>
                <span className="font-medium">₹{bookingData.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes:</span>
                <span className="font-medium">₹0</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-emerald-600">₹{bookingData.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
            
            <div className="space-y-4 mb-6">
              {/* Credit/Debit Card */}
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition duration-200">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCardIcon className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Visa, MasterCard, RuPay</div>
                </div>
              </label>

              {/* UPI */}
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition duration-200">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedPaymentMethod === 'upi'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <DevicePhoneMobileIcon className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">UPI</div>
                  <div className="text-sm text-gray-500">PhonePe, Google Pay, Paytm</div>
                </div>
              </label>

              {/* Net Banking */}
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition duration-200">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={selectedPaymentMethod === 'netbanking'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <ComputerDesktopIcon className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Net Banking</div>
                  <div className="text-sm text-gray-500">All major banks supported</div>
                </div>
              </label>
            </div>

            {/* Payment Form */}
            {selectedPaymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              )}
              <div className="mt-8">
                <button
                  className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  onClick={() => handleRazorpayPayment()}
                  disabled={loading}
                >
                  {loading ? <Loader size="w-5 h-5" color="border-white" /> : "Pay with Razorpay"}
                </button>
              </div>

            {selectedPaymentMethod === 'upi' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="yourname@paytm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}

            {selectedPaymentMethod === 'netbanking' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option>Select your bank</option>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-emerald-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                `Confirm & Pay ₹${bookingData.totalPrice.toLocaleString()}`
              )}
            </button>

            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>100% secure and encrypted payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;