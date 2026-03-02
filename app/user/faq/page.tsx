"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "1",
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Browse products, add them to your cart, and proceed to checkout. Fill in your delivery address, select a payment method, and confirm your order.",
  },
  {
    id: "2",
    category: "Orders",
    question: "Can I cancel or modify my order?",
    answer:
      "You can cancel or modify orders within 1 hour of placing them. After that, the order enters the preparation phase and cannot be modified.",
  },
  {
    id: "3",
    category: "Delivery",
    question: "What are the delivery charges?",
    answer:
      "Delivery charges depend on your location and order value. Orders above ₹500 get free delivery in most areas. Check the checkout page for exact charges.",
  },
  {
    id: "4",
    category: "Delivery",
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 24-48 hours. Express delivery available in select areas within 6-12 hours. Delivery time calculated from order confirmation.",
  },
  {
    id: "5",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept credit/debit cards, digital wallets (Google Pay, Apple Pay), UPI (Unified Payments Interface), and net banking. You can also pay cash on delivery.",
  },
  {
    id: "6",
    category: "Payments",
    question: "Is my payment information secure?",
    answer:
      "Yes, we use industry-standard SSL encryption to protect your payment information. All transactions are PCI-DSS compliant.",
  },
  {
    id: "7",
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "Fresh items can be rejected upon delivery if damaged. Other items can be returned within 7 days of delivery in original condition with receipt.",
  },
  {
    id: "8",
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox to reset your password.",
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = FAQS.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(FAQS.map((faq) => faq.category)));
  const groupedFAQs = categories.map((category) => ({
    category,
    faqs: filteredFAQs.filter((faq) => faq.category === category),
  }));

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
            <p className="text-gray-600 mt-2">
              Find answers to common questions about orders, delivery, payments, and more.
            </p>
          </div>

          {/* Search */}
          <motion.div variants={item} className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
            />
          </motion.div>

          {/* FAQs by Category */}
          <motion.div variants={container} className="space-y-8">
            {groupedFAQs.map(({ category, faqs }) =>
              faqs.length > 0 ? (
                <motion.div key={category} variants={item} className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                  <div className="space-y-2">
                    {faqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                          className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-900 flex-1 pr-4">
                            {faq.question}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          </motion.div>
                        </button>

                        {expandedId === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="px-6 py-4 bg-gray-50 text-gray-700">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </Card>
                    ))}
                  </div>
                </motion.div>
              ) : null
            )}
          </motion.div>

          {/* No Results */}
          {filteredFAQs.length === 0 && (
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-600">No FAQs match your search.</p>
              <p className="text-gray-500 text-sm mt-1">Try different keywords.</p>
            </Card>
          )}

          {/* Contact Card */}
          {filteredFAQs.length > 0 && (
            <Card className="bg-green-50 rounded-xl border border-green-100 p-6">
              <h3 className="font-semibold text-green-900 mb-2">Still have questions?</h3>
              <p className="text-green-800 text-sm">
                Can't find the answer you're looking for? Contact our customer support team.
                We're available Mon-Sun, 9:00 AM - 10:00 PM.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
