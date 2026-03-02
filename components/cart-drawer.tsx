"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, totalItems, totalAmount } =
    useCartStore();
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const goCheckout = () => {
    onClose();
    router.push("/user/checkout");
  };

  const cartContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Container - Full Height, No Gap */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-screen w-full sm:w-96 bg-background shadow-2xl shadow-black/20 flex flex-col border-l"
          >
            {/* Header - Fixed */}
            <CartHeader t={t} onClose={onClose} cartItemsCount={totalItems()} />

            {/* Content - Scrollable Middle Section */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
              <div className="pb-40">
                {items.length === 0 ? (
                  <EmptyCartState onClose={onClose} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 p-4"
                  >
                    {items.map(({ product, quantity }, index) => (
                      <CartItemCard
                        key={product.id}
                        product={product}
                        quantity={quantity}
                        onQuantityChange={(newQty) =>
                          updateQuantity(product.id, newQty)
                        }
                        onRemove={() => removeItem(product.id)}
                        index={index}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer - Fixed Bottom */}
            {items.length > 0 && (
              <CartFooter
                t={t}
                totalAmount={totalAmount()}
                totalItems={totalItems()}
                onCheckout={goCheckout}
                onContinueShopping={onClose}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(cartContent, document.body);
}

// `t` is passed from CartDrawer to avoid duplicate hooks
function CartHeader({
  t,
  onClose,
  cartItemsCount,
}: {
  t: (key: string) => string;
  onClose: () => void;
  cartItemsCount: number;
}) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-background to-background/95 px-6 shadow-sm flex-shrink-0"
    >
      <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingCart className="h-5 w-5 text-primary" />
        </motion.div>
        {t("cart.title")}
      </h2>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label="Close cart"
      >
        <X className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

function CartFooter({
  t,
  totalAmount,
  totalItems,
  onCheckout,
  onContinueShopping,
}: {
  t: (key: string) => string;
  totalAmount: number;
  totalItems: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="border-t bg-gradient-to-t from-background via-background to-background/95 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] p-6 space-y-4 flex-shrink-0"
    >
      {/* Total Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("cart.total")}
        </span>
        <motion.span
          key={totalAmount}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-foreground"
        >
          {formatPrice(totalAmount)}
        </motion.span>
      </motion.div>

      {/* Items Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xs text-muted-foreground text-center"
      >
        {totalItems} {t("cart.items")}{totalItems !== 1 ? "s" : ""} in your cart
      </motion.div>

      {/* Checkout Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onCheckout}
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-base rounded-xl shadow-lg shadow-primary/30 transition-all duration-300"
        >
          {t("buttons.placeOrder")}
        </Button>
      </motion.div>

      {/* Continue Shopping */}
      <Button
        variant="ghost"
        onClick={onContinueShopping}
        className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
      >
        Continue Shopping
      </Button>
    </motion.div>
  );
}

function CartItemCard({
  product,
  quantity,
  onQuantityChange,
  onRemove,
  index,
}: {
  product: any;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-card/50 p-3 hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
    >
      {/* Product Image */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
          {product.categoryName}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-primary text-sm">
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>

      {/* Quantity Controls & Delete */}
      <div className="flex flex-col items-center gap-2">
        {/* Quantity Selector */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 p-1"
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary/20 transition-colors"
          >
            <Minus className="h-3 w-3 text-primary" />
          </motion.button>
          <motion.span
            key={quantity}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-5 text-center text-xs font-bold text-primary"
          >
            {quantity}
          </motion.span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3 text-primary" />
          </motion.button>
        </motion.div>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function EmptyCartState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10"
      >
        <ShoppingCart className="h-8 w-8 text-primary/60" />
      </motion.div>
      <div className="text-center space-y-2">
        <p className="font-semibold text-foreground text-lg">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">
          Add some fresh groceries to get started!
        </p>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4"
      >
        <Button
          onClick={onClose}
          className="bg-gradient-to-r from-primary to-primary/90 text-white font-semibold"
        >
          Start Shopping
        </Button>
      </motion.div>
    </motion.div>
  );
}
