import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero({ company }) {
  const whatsappNumber = (company?.whatsapp || '+919325303018').replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(
    'Hello 4Core Exim Trade Desk — I would like to request a wholesale export quotation and MOQ details.'
  );
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  return (
    <section className="relative overflow-hidden border-b border-brand-gray-200">
      {/* Full-bleed atmosphere */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-brand-gray-900 via-brand-gray-900 to-brand-gray-800"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(185, 28, 28, 0.35) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(248, 250, 252, 0.06) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center gap-2.5 mb-6"
          >
            <span className="bg-brand-red-600 text-white font-bold text-sm px-2.5 py-1 rounded tracking-wide">
              4CORE
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Exim
            </span>
          </motion.div>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red-100/80 mb-3"
          >
            By Thakkar Medico Traders
          </motion.p>

          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight"
          >
            Wholesale pharmaceutical export supply from India
          </motion.h1>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 text-sm sm:text-base text-brand-gray-300 leading-relaxed max-w-xl"
          >
            WHO-GMP sourced branded and generic formulations for licensed distributors —
            quote MOQ, CoA, and FOB/CIF pricing with our trade desk in minutes.
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3"
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-sm"
            >
              <FaWhatsapp className="text-base" />
              <span>WhatsApp Trade Desk</span>
            </a>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-brand-gray-100 text-brand-gray-900 font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              <span>Browse Catalog</span>
              <FiArrowRight className="text-sm" />
            </Link>
          </motion.div>

          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4"
          >
            <a
              href="#inquiry-form"
              className="text-xs font-semibold text-brand-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Prefer email? Request a quote →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
