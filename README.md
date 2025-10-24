QuickCourt - Court Booking and Management Platform

QuickCourt is a full-stack web application designed to streamline legal workflows, including case filing, lawyer-client interactions, document management, and digital payments. The platform aims to bring transparency, speed, and convenience to the judicial process through automation and modern web technologies.

🚀 Features

• Secure user authentication (Admin, Lawyer, and Client roles)

• Case filing, tracking, and management system

• Email-based OTP authentication via Brevo API

• Online payment gateway integration via Razorpay

• Real-time case updates and document uploads

• Responsive dashboard with analytics

• Admin panel for user and case control

⚙️ Tech Stack
• Frontend: React.js + Tailwind CSS

• Backend: Node.js + Express.js

• Database: MongoDB (Mongoose Atlas)

• Deployment: Vercel (Frontend) + Render (Backend)

• Email OTP: Brevo API (Transactional Emails)

• Payments: Razorpay Payment Gateway

🧩 OTP Verification (via Brevo)
QuickCourt uses Brevo (formerly SendinBlue) for secure and reliable OTP delivery during user registration and login verification.

✅ Fast and free SMTP API for OTPs

✅ Custom HTML templates for email verification

✅ Secure token-based OTP validation

💳 Payment Integration (via Razorpay)
Razorpay integration allows users to pay court fees, lawyer consultation charges, or document processing fees directly through QuickCourt. The integration ensures secure transactions and real-time payment verification.

✅ Razorpay test and live modes supported

✅ Payment success/failure callbacks handled in Node.js backend

✅ Secure API key handling with environment variables (.env)

🛠️ Environment Variables
To run QuickCourt locally, create a `.env` file in the backend directory and add the following:

PORT=5000
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

BREVO_API_KEY=your_brevo_api_key

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_key_secret

🚀 Installation

1️⃣ Clone the repository:
   git clone https://github.com/anvayuparkar/QuickCourt.git
   
2️⃣ Navigate to backend and frontend folders and install dependencies
   npm install
   
3️⃣ Start backend and frontend:
   npm run dev
   
📡 Deployment
• Frontend hosted on Vercel
• Backend hosted on Render
• MongoDB hosted on Atlas
• Razorpay and Brevo integrated using API keys

📬 Contact :
Developed by Anvay Uparkar, Sanam , Yeshvi
📧 Email: 
- anvaymuparkar@gmail.com
- sanamjbhatia@gmail.com
- yeshvi.chandiramani@gmail.com
