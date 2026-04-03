"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const FAQS = [
  { id: "1", categoryKey: "orders", qKey: "q1", aKey: "a1" },
  { id: "2", categoryKey: "orders", qKey: "q2", aKey: "a2" },
  { id: "3", categoryKey: "delivery", qKey: "q3", aKey: "a3" },
  { id: "4", categoryKey: "delivery", qKey: "q4", aKey: "a4" },
  { id: "5", categoryKey: "payments", qKey: "q5", aKey: "a5" },
  { id: "6", categoryKey: "payments", qKey: "q6", aKey: "a6" },
  { id: "7", categoryKey: "returns", qKey: "q7", aKey: "a7" },
  { id: "8", categoryKey: "account", qKey: "q8", aKey: "a8" },
] as const;

export default function FAQPage() {
  const t = useTranslations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const localizedFaqs = FAQS.map((faq) => ({
    id: faq.id,
    category: t(`faq.categories.${faq.categoryKey}`),
    question: t(`faq.items.${faq.qKey}`),
    answer: t(`faq.items.${faq.aKey}`),
  }));

  const filteredFAQs = localizedFaqs.filter((faq) => {
    const q = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q) || faq.category.toLowerCase().includes(q);
  });

  const categories = Array.from(new Set(localizedFaqs.map((faq) => faq.category)));
  const groupedFAQs = categories.map((category) => ({
    category,
    faqs: filteredFAQs.filter((faq) => faq.category === category),
  }));

  return (
    <div className="space-y-8">
      <BackButton />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("faq.title")}</h1>
          <p className="text-gray-600 mt-2">{t("faq.subtitle")}</p>
        </div>

        <motion.div variants={item} className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("faq.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 pl-10 focus:ring-2 focus:ring-green-500"
          />
        </motion.div>

        <motion.div variants={container} className="space-y-8">
          {groupedFAQs.map(({ category, faqs }) =>
            faqs.length > 0 ? (
              <motion.div key={category} variants={item} className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="font-medium text-gray-900 flex-1 pr-4">{faq.question}</span>
                        <motion.div animate={{ rotate: expandedId === faq.id ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
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
                          <div className="px-6 py-4 bg-gray-50 text-gray-700">{faq.answer}</div>
                        </motion.div>
                      )}
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : null
          )}
        </motion.div>

        {filteredFAQs.length === 0 && (
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600">{t("faq.noResults")}</p>
            <p className="text-gray-500 text-sm mt-1">{t("faq.tryDifferent")}</p>
          </Card>
        )}

        {filteredFAQs.length > 0 && (
          <Card className="bg-green-50 rounded-xl border border-green-100 p-6">
            <h3 className="font-semibold text-green-900 mb-2">{t("faq.stillQuestions")}</h3>
            <p className="text-green-800 text-sm">{t("faq.stillQuestionsDesc")}</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
