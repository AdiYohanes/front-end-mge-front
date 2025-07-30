// src/pages/FaqPage.jsx

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFaqsThunk } from "../features/faqs/faqsSlice";
import { gsap } from "gsap";

const FaqPage = () => {
  const dispatch = useDispatch();
  const { faqs, status, error } = useSelector((state) => state.faqs);

  const faqContainerRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFaqsThunk());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Animasi saat data berhasil dimuat
    if (status === "succeeded" && faqContainerRef.current) {
      gsap.from(faqContainerRef.current.children, {
        duration: 0.5,
        opacity: 0,
        y: 20,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [status]);

  let content;

  if (status === "loading") {
    // Skeleton loading untuk FAQ
    content = (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  } else if (status === "succeeded") {
    content = (
      <div ref={faqContainerRef} className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="collapse bg-base-100 shadow-sm rounded-lg"
          >
            {/* Menggunakan radio input agar hanya satu item yang bisa terbuka */}
            <input
              type="radio"
              name="faq-accordion"
              defaultChecked={index === 0}
            />
            <div className="collapse-title text-xl font-medium text-theme-primary flex items-center justify-between">
              <span>{faq.question}</span>
              <svg
                className="w-5 h-5 transition-transform duration-200 collapse-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <div className="collapse-content">
              <p className="text-theme-secondary whitespace-pre-line">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (status === "failed") {
    content = <p className="text-center text-error">{error}</p>;
  }

  return (
    <div className="bg-theme-secondary min-h-[calc(100vh-15rem)]">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-minecraft mb-4 text-theme-primary">
            Frequently Asked Questions
          </h1>
          <p className="text-theme-secondary leading-relaxed">
            Tidak menemukan jawaban yang Anda cari? Hubungi kami langsung. Kami
            siap membantu!
          </p>
        </div>
        <div className="max-w-4xl mx-auto">{content}</div>
      </div>
    </div>
  );
};

export default FaqPage;
