"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "919458829385";

  const message = encodeURIComponent(
    "Hello, I would like to know more about your products."
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-[#25D366]
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:scale-110
        hover:shadow-xl
        md:bottom-8
        md:right-8
      "
    >
      <MessageCircle size={28} strokeWidth={2.2} />
    </a>
  );
}
