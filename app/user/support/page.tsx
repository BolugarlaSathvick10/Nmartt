"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <BackButton />
        
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
            <p className="text-gray-600 mt-2">
              We're here to help. Get in touch with our support team.
            </p>
          </div>

          {/* Contact Methods */}
          <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Chat with our support team in real-time
                    </p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-lg p-3 flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      support@nmart.com
                    </p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                      Send Email
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 rounded-lg p-3 flex-shrink-0">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      +91-XXXX-XXXX-XXXX
                    </p>
                    <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                      Call Us
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-lg p-3 flex-shrink-0">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Mon-Sun: 9:00 AM - 10:00 PM
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Response time: Within 2 hours</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Message Form */}
          <motion.div variants={item}>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-1">Subject</label>
                  <Input
                    placeholder="How can we help?"
                    className="border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-1">Message</label>
                  <textarea
                    placeholder="Describe your issue..."
                    rows={4}
                    className="border border-gray-200 rounded-lg px-3 py-2 w-full font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Send Message
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Info Card */}
          <Card className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Response Time</h3>
            <p className="text-blue-800 text-sm">
              We typically respond to all inquiries within 2-4 hours during business hours. 
              For urgent matters, please call our support line.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
