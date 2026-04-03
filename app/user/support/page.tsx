"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SupportPage() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <BackButton />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("support.title")}</h1>
          <p className="text-gray-600 mt-2">{t("support.subtitle")}</p>
        </div>

        <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow h-full">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("support.liveChat")}</h3>
                  <p className="text-gray-600 text-sm mt-1">{t("support.liveChatDesc")}</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">{t("support.startChat")}</Button>
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
                  <h3 className="text-lg font-semibold text-gray-900">{t("support.emailSupport")}</h3>
                  <p className="text-gray-600 text-sm mt-1">support@nmart.com</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">{t("support.sendEmail")}</Button>
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
                  <h3 className="text-lg font-semibold text-gray-900">{t("support.phoneSupport")}</h3>
                  <p className="text-gray-600 text-sm mt-1">+91-XXXX-XXXX-XXXX</p>
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">{t("support.callUs")}</Button>
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
                  <h3 className="text-lg font-semibold text-gray-900">{t("support.businessHours")}</h3>
                  <p className="text-gray-600 text-sm mt-1">{t("support.businessHoursValue")}</p>
                  <p className="text-gray-500 text-xs mt-2">{t("support.responseWithin2Hours")}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("support.sendMessage")}</h3>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">{t("support.email")}</label>
                <Input type="email" placeholder={t("support.emailPlaceholder")} className="border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">{t("support.subject")}</label>
                <Input placeholder={t("support.subjectPlaceholder")} className="border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-1">{t("support.message")}</label>
                <textarea
                  placeholder={t("support.messagePlaceholder")}
                  rows={4}
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">{t("support.sendMessageButton")}</Button>
            </form>
          </Card>
        </motion.div>

        <Card className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t("support.responseTime")}</h3>
          <p className="text-blue-800 text-sm">{t("support.responseTimeDesc")}</p>
        </Card>
      </motion.div>
    </div>
  );
}
