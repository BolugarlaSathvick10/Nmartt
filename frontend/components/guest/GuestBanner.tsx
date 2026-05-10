"use client";

export default function GuestBanner() {
  return (
    <div className="w-full border-b bg-yellow-50/90 px-5 py-1.5 text-xs text-foreground backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center">
        <p className="truncate">You are browsing as a guest. Login to place orders and save your cart permanently.</p>
      </div>
    </div>
  );
}