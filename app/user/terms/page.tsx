"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const sections = [
  {
    title: "Terms of Service",
    content:
      "By using N-Mart, you agree to our terms of service. These terms govern your use of our platform and the purchase of products from us.",
  },
  {
    title: "Privacy Policy",
    content:
      "We respect your privacy. We collect and use your personal information only to provide you with better service and improve our platform. We do not share your information with third parties without your consent.",
  },
  {
    title: "Refund Policy",
    content:
      "Fresh items can be rejected upon delivery if damaged or expired. Other items can be returned within 7 days of delivery for a full refund. Refunds are processed within 5-7 business days.",
  },
  {
    title: "Cancellation Policy",
    content:
      "Orders can be cancelled within 1 hour of placement without any charges. Cancellations after 1 hour may incur a cancellation fee depending on the order status.",
  },
  {
    title: "Shipping Policy",
    content:
      "We deliver to most locations within 24-48 hours. Standard delivery charges apply unless you qualify for free delivery. Express delivery is available in select areas for an additional fee.",
  },
  {
    title: "Payment Security",
    content:
      "All payments are processed through secure SSL-encrypted channels. We support multiple payment methods including credit cards, debit cards, digital wallets, and net banking. Your payment information is never stored on our servers.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content on N-Mart, including logos, product images, and descriptions, are the property of N-Mart or our suppliers. Unauthorized use or reproduction is prohibited.",
  },
  {
    title: "Limitation of Liability",
    content:
      "N-Mart is not liable for indirect, incidental, or consequential damages arising from the use of our platform or products. Our liability is limited to the amount paid for the product.",
  },
  {
    title: "Dispute Resolution",
    content:
      "Any disputes arising from your use of N-Mart will be resolved through negotiation or mediation. If necessary, disputes will be handled in the courts of the jurisdiction where N-Mart is located.",
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of N-Mart constitutes acceptance of the modified terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terms & Policies</h1>
            <p className="text-gray-600 mt-2">
              Please read our terms and policies carefully before using N-Mart
            </p>
            <p className="text-sm text-gray-500 mt-4">Last updated: December 2024</p>
          </div>

          {/* Terms Sections */}
          <motion.div variants={container} className="space-y-4">
            {sections.map((section, index) => (
              <motion.div key={index} variants={item}>
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Acceptance */}
          <Card className="bg-green-50 rounded-xl border border-green-100 p-6">
            <h3 className="font-semibold text-green-900 mb-2">Acceptance of Terms</h3>
            <p className="text-green-800 text-sm">
              By accessing and using N-Mart, you acknowledge that you have read, understood, 
              and agree to be bound by all terms and policies outlined above. If you do not 
              agree with any part of these terms, please do not use our platform.
            </p>
          </Card>

          {/* Contact */}
          <Card className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Questions or Concerns?</h3>
            <p className="text-blue-800 text-sm mb-3">
              If you have any questions about our terms and policies, please contact us:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Email: legal@nmart.com</li>
              <li>Phone: +91-XXXX-XXXX-XXXX</li>
              <li>Address: N-Mart Head Office, City Center, Your City</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
