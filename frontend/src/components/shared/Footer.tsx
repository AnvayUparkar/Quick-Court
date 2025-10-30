import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          © 2025 Anvay Mahesh Uparkar | All Rights Reserved
        </div>

        <div className="flex items-center gap-4">
          <Link to="/terms" className="text-sm text-indigo-600 hover:underline">Terms</Link>
          <Link to="/privacy" className="text-sm text-indigo-600 hover:underline">Privacy</Link>
          <Link to="/refund" className="text-sm text-indigo-600 hover:underline">Refund</Link>
        </div>

        <div className="text-sm text-gray-600">
          <a href="mailto:anvaymuparkar@gmail.com" className="text-indigo-600 hover:underline">anvaymuparkar@gmail.com</a>
          <span className="mx-2">|</span>
          <a href="tel:9702017203" className="text-indigo-600 hover:underline">9702017203</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
