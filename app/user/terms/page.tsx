"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function TermsPage() {
  const t = useTranslations();
  const sections = Array.from({ length: 10 }, (_, idx) => {
    const number = idx + 1;
    return {
      title: t(`terms.sections.s${number}Title`),
      content: t(`terms.sections.s${number}Content`),
    };
  });

  return (
    <div className="space-y-8">
      <BackButton />
      
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("terms.title")}</h1>
            <p className="text-gray-600 mt-2">
              {t("terms.subtitle")}
            </p>
            <p className="text-sm text-gray-500 mt-4">{t("terms.lastUpdated")}</p>
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
            <h3 className="font-semibold text-green-900 mb-2">{t("terms.acceptanceTitle")}</h3>
            <p className="text-green-800 text-sm">
              {t("terms.acceptanceDesc")}
            </p>
          </Card>

          {/* Contact */}
          <Card className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">{t("terms.contactTitle")}</h3>
            <p className="text-blue-800 text-sm mb-3">
              {t("terms.contactDesc")}
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t("terms.email")}</li>
              <li>{t("terms.phone")}</li>
              <li>{t("terms.address")}</li>
            </ul>
          </Card>
        </motion.div>
    </div>
  );
}
