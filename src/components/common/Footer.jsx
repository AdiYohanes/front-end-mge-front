// src/components/common/Footer.jsx

import React from "react";
import { Link } from "react-router";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  const socialMediaLinks = [
    { icon: <FaYoutube />, link: "#" },
    { icon: <FaTiktok />, link: "#" },
    { icon: <FaInstagram />, link: "#" },
    { icon: <FaFacebookF />, link: "#" },
  ];

  return (
    <footer className="text-theme-secondary p-8 lg:p-16 border-t border-theme" style={{ backgroundColor: '#1a100f' }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <Link to="/">
              <img src="/images/logo.png" alt="Logo" className="h-20 w-auto" />
            </Link>
            <h3 className="text-xl font-bold text-white">
              Medan Gaming Ecosystem
            </h3>
            <p className="text-sm leading-relaxed text-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum vestibulum odio sit amet auctor suscipit. Aenean a
              viverra nisi. Nunc faucibus vulputate augue eu convallis.
            </p>
          </div>

          {/* Kolom Kanan */}
          <div>
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.045181464701!2d98.66470481086259!3d3.57708959638205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3031302c469c3ffd%3A0xf2807430a139f076!2sJl.%20Jenderal%20Sudirman%20No.67%2C%20Petisah%20Hulu%2C%20Kec.%20Medan%20Baru%2C%20Kota%20Medan%2C%20Sumatera%20Utara%2020152!5e0!3m2!1sid!2sid!4v1752165586953!5m2!1sid!2sid"
                width="800"
                height="250"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="space-y-4 text-sm">
              {/* Address Section */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div>
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">Our Location</h4>
                    <p className="text-white font-medium">
                      Jl. Jendral Sudirman No. 67, Medan Sunggal, Sumatera Utara, Indonesia
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">Contact:</span> +62 812-3456-7890
                      </p>
                      <p className="text-white text-sm">
                        <span className="font-medium">Hours:</span> 09:00 - 21:00 Daily
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs order-2 md:order-1">
            <Link to="/" className="hover:text-theme-primary transition-colors">
              Home
            </Link>
            <Link to="/terms" className="hover:text-theme-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
            <Link to="/legal" className="hover:text-white transition-colors">
              Legal
            </Link>
          </div>
          <div className="text-xs order-1 md:order-2">
            © {new Date().getFullYear()} Copyright By MGE
          </div>
          <div className="flex gap-5 text-lg order-3">
            {socialMediaLinks.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-secondary hover:text-theme-primary transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
