import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-primary">Rihan-Collection</h3>
          <p className="text-gray-600">
            Pochi za kisasa kwa wanawake. Elegance, confidence, na style kila siku.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-md font-semibold mb-4 text-primary">Quick Links</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link to="/shop" className="hover:text-primary transition">Shop</Link></li>
            <li><Link to="/cart" className="hover:text-primary transition">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-primary transition">Orders</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-md font-semibold mb-4 text-primary">Contact Us</h4>
          <p className="text-gray-600">ramlanzonge@icloud.com</p>
          <p className="text-gray-600">+255 713 551 801</p>
          <p className="text-gray-600">Dar es Salaam, Tanzania</p>
        </div>
      </div>

      <div className="border-t border-gray-300 mt-6 py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Rihan-Collection. All rights reserved.
      </div>
    </footer>
  );
}
