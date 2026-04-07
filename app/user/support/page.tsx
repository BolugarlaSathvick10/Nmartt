"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SupportPage() {
  const t = useTranslations();
  const whatsappNumber = "919059179335";
  const supportEmail = "sathvickbolugarla10@gmail.com";
  const phoneNumber = "+91 90591 79335";

  const handleWhatsAppChat = () => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank", "noopener,noreferrer");
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  const handleCallUs = () => {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`;
  };

  return (
    <div className="space-y-8">
      <BackButton />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("support.title")}</h1>
          <p className="text-gray-600 mt-2">{t("support.subtitle")}</p>
        </div>

        <motion.div variants={item}>
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="bg-slate-100 rounded-lg p-2 flex-shrink-0">
                <Clock className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Support Timings: Mon-Sun, 9:00 AM - 10:00 PM</p>
                <p className="text-gray-600 mt-0.5">Typical response time: Within 2 hours</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={container} className="grid md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp Chat</h3>
                  <p className="text-gray-600 text-sm mt-1">+91 90591 79335</p>
                  <Button onClick={handleWhatsAppChat} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Send Message
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
                  <p className="text-gray-600 text-sm mt-1">{supportEmail}</p>
                  <Button onClick={handleSendEmail} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
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
                  <p className="text-gray-600 text-sm mt-1">{phoneNumber}</p>
                  <Button onClick={handleCallUs} className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                    Call Us
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
