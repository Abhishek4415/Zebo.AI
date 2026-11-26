import React from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Zebo<span className="text-indigo-600">.ai</span>
            </h2>

            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Prepare smarter, build confidence, and ace your
              next interview with AI-powered interview practice
              and personalized feedback.
            </p>

            {/* Social Media */}
            <div className="flex gap-4 mt-5">
              <a href="https://github.com"
                aria-label="GitHub"
                className="text-gray-500 hover:text-indigo-600 transition">
                <FaGithub size={21} />
              </a>

              <a href="https://linkedin.com"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-indigo-600 transition">
                <FaLinkedin size={21} />
              </a>

              <a href="https://instagram.com"
                aria-label="Instagram"
                className="text-gray-500 hover:text-indigo-600 transition">
                <FaInstagram size={21} />
              </a>
            </div>
          </div>

          {/* Platform Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Platform
            </h3>

            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-indigo-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/interview" className="hover:text-indigo-600">
                  AI Interview
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-indigo-600">
                  Interview History
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-indigo-600">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Company
            </h3>

            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link to="/about" className="hover:text-indigo-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-600">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Get in Touch
            </h3>

            <p className="text-sm text-gray-500 leading-relaxed">
              Have questions or feedback? We would love to hear
              from you.
            </p>

            <Link
              to="/contact"
              className="flex items-center gap-2 text-sm
              text-gray-600 hover:text-indigo-600 mt-4"
            >
              <HiOutlineMail size={20} />
              Contact Support
            </Link>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 mt-10 pt-6
          flex flex-col sm:flex-row items-center
          justify-between gap-4">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Zebo.ai. All rights reserved.
          </p>

          <p className="text-sm text-gray-500">
            Empowering careers with Artificial Intelligence.
          </p>

        </div>
      </div>
    </footer>
  );
}

export default Footer;