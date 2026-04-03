"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store";
import { formatProductUnit, parseProductUnits } from "@/lib/product-units";

interface ProductCardProps {
  product: Product;
  isNew?: boolean;
}

export function ProductCard({ product, isNew = false }: ProductCardProps) {
  const locale = useLocale();
  const hasDiscount = product.originalPrice != null;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const localizedProductName = localizeProductName(product.name, locale);
  const localizedCategoryName = localizeCategoryName(product.categoryName, locale);
  const unitOptions = useMemo(() => parseProductUnits(product.unit), [product.unit]);
  const [selectedUnit, setSelectedUnit] = useState(unitOptions[0] ?? product.unit);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const quantity = useCartStore((state) => state.getItemQuantity(product.id, selectedUnit));

  useEffect(() => {
    if (!unitOptions.includes(selectedUnit)) {
      setSelectedUnit(unitOptions[0] ?? product.unit);
    }
  }, [product.unit, selectedUnit, unitOptions]);

  const hasUnitOptions = unitOptions.length > 1;

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
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 sm:h-52">
          <img
            src={product.image}
            alt={localizedProductName}
            className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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

        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
              {localizedProductName}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              {localizedCategoryName}
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

          <div className="mb-3 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Quantity
            </p>
            {hasUnitOptions ? (
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="h-8 rounded-md text-xs">
                  <SelectValue placeholder="Choose quantity" />
                </SelectTrigger>
                <SelectContent className="z-[90]">
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {formatProductUnit(unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                {formatProductUnit(selectedUnit)}
              </div>
            )}
          </div>

          {/* Action Button */}
          {quantity === 0 ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-none hover:shadow-none hover:from-primary hover:to-primary/95 transition-colors duration-200 text-white font-medium focus-visible:ring-offset-0"
                onClick={() => addItem(product, 1, selectedUnit)}
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
                onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1), selectedUnit)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-transparent hover:bg-primary/15 transition-colors"
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
                onClick={() => updateQuantity(product.id, quantity + 1, selectedUnit)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-transparent hover:bg-primary/15 transition-colors"
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
