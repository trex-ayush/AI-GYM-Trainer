import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiGithub, FiTwitter, FiLinkedin, FiMail, FiActivity } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FiGithub />, href: '#', label: 'GitHub' },
    { icon: <FiTwitter />, href: '#', label: 'Twitter' },
    { icon: <FiLinkedin />, href: '#', label: 'LinkedIn' },
    { icon: <FiMail />, href: '#', label: 'Email' },
  ];

  const footerLinks = [
    { title: 'About', href: '#' },
    { title: 'Privacy', href: '#' },
    { title: 'Terms', href: '#' },
    { title: 'Contact', href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                <FiActivity className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                AI Fitness Coach
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transform your fitness journey with AI-powered personalized plans.
            </p>
          </div>

          <div className="flex justify-center">
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Quick Links
              </h3>
              <div className="space-y-2">
                {footerLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link.title}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Connect
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    title={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} AI Fitness Coach. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-2 md:mt-0">
              Made with <FiHeart className="mx-1 text-red-500" /> for fitness enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;