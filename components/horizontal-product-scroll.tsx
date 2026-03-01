"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { formatPrice } from "@/lib/utils";
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
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gradient-to-r from-background via-background/80 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </motion.button>

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex-shrink-0 w-[160px] sm:w-[180px]"
            >
              <Card className="glass-card border-amber-500/30 overflow-hidden hover:shadow-xl hover:border-amber-500/60 transition-all duration-300 group/card h-full flex flex-col">
                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                  <img
                    src={product.image}
                    alt={product.name}
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

                {/* Content */}
                <CardContent className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex-1">
                    {product.categoryName}
                  </p>

                  {/* Price (if available) */}
                  {product.price && (
                    <p className="text-xs font-bold text-primary mt-2">
                      {formatPrice(product.price)}
                    </p>
                  )}

                  {/* Action Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3"
                  >
                    <Button
                      size="sm"
                      variant={isInterested(product.id) ? "secondary" : "default"}
                      className="w-full text-xs gap-1 h-8 font-medium"
                      onClick={() => onNotifyMe(product.id)}
                      disabled={isInterested(product.id)}
                    >
                      <Bell className="h-3 w-3" />
                      {isInterested(product.id) ? "Subscribed" : "Notify"}
                    </Button>
                  </motion.div>

                  {/* Interest Count */}
                  {interestCount(product.id) > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-1.5">
                      {interestCount(product.id)} interested
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: canScrollRight ? 1 : 0.3, x: 0 }}
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gradient-to-l from-background via-background/80 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 disabled:cursor-not-allowed"
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
