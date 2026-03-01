"use client";

import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  isNew?: boolean;
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
  isNew = false,
}: ProductCardProps) {
  const hasDiscount = product.originalPrice != null;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="glass-card border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
        {/* Image Section */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute inset-0 flex flex-col gap-2 p-2">
            {isNew && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-fit rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg"
              >
                New
              </motion.span>
            )}
            {hasDiscount && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-fit rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg"
              >
                {discountPercent}% off
              </motion.span>
            )}
          </div>

          {/* Overlay Shadow on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              {product.categoryName}
            </p>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between mt-3 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-primary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {quantity === 0 ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg shadow-primary/20 transition-all duration-300 text-white font-medium"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add to Cart
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 p-1.5 w-full justify-center"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onDecrease}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-primary/20 transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-primary" />
              </motion.button>
              <motion.span
                key={quantity}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex w-8 items-center justify-center text-sm font-bold text-primary"
              >
                {quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onIncrease}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
              </motion.button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
