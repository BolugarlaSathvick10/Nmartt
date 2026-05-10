"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HorizontalProductScrollProps {
  products: Product[];
  isInterested?: (id: string) => boolean;
  onNotifyMe?: (id: string) => void;
  interestCount?: (id: string) => number;
  title: string;
  description?: string;
}

export function HorizontalProductScroll({
  products,
  isInterested = () => false,
  onNotifyMe = () => {},
  interestCount = () => 0,
  title,
  description,
}: HorizontalProductScrollProps) {
  const locale = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      checkScroll();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3 sm:space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: canScrollLeft ? 1 : 0.3, x: 0 }}
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-background via-background/80 to-transparent p-1.5 transition-opacity duration-300 disabled:cursor-not-allowed lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </motion.button>

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 scroll-smooth sm:gap-4 md:gap-5 lg:gap-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product) => {
            const localizedProductName = localizeProductName(product.name, locale);
            const localizedCategoryName = localizeCategoryName(product.categoryName, locale);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
                style={{ width: "clamp(150px, 42vw, 220px)", minWidth: "clamp(150px, 42vw, 220px)" }}
              >
                <Card className="glass-card border-amber-500/30 overflow-hidden hover:shadow-xl hover:border-amber-500/60 transition-all duration-300 group/card h-full flex flex-col">
                  <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 sm:h-40 md:h-48 lg:h-52">
                    <img
                      src={product.image}
                      alt={localizedProductName}
                      className="h-full w-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    />
                    <motion.span
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute top-2 left-2 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs text-white font-semibold shadow-lg"
                    >
                      Coming
                    </motion.span>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                      {localizedProductName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide flex-1">
                      {localizedCategoryName}
                    </p>

                    {product.price && (
                      <p className="mt-2.5 text-base font-bold text-primary sm:mt-3 sm:text-lg">
                        {formatPrice(product.price)}
                      </p>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3"
                    >
                      <Button
                        size="sm"
                        variant={isInterested(product.id) ? "outline" : "default"}
                        className="h-8 w-full gap-1.5 text-xs font-medium shadow-none hover:shadow-none focus-visible:ring-offset-0 sm:h-9 sm:text-sm"
                        onClick={() => onNotifyMe(product.id)}
                      >
                        <Bell className="h-4 w-4" />
                        {isInterested(product.id) ? "Remove Interest" : "Notify"}
                      </Button>
                    </motion.div>

                    {interestCount(product.id) > 0 && (
                      <p className="text-xs text-muted-foreground text-center mt-1.5">
                        {interestCount(product.id)} interested
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: canScrollRight ? 1 : 0.3, x: 0 }}
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-gradient-to-l from-background via-background/80 to-transparent p-1.5 transition-opacity duration-300 disabled:cursor-not-allowed lg:opacity-0 lg:group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </motion.button>
      </div>

      {/* Custom scrollbar hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
