"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Wallet } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300 backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-fuchsia-500 mr-2 animate-pulse" />
          Introducing eMakao 2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
        >
          The Operating System for{" "}
          <span className="text-gradient bg-gradient-to-r from-fuchsia-400 to-blue-400">
            Modern Real Estate
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10"
        >
          End-to-end property management, automated financial reconciliation, and a seamless mobile experience for your tenants. Scale your portfolio without scaling your headcount.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="http://localhost:3000"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white text-black px-8 font-medium transition-transform hover:scale-105 active:scale-95"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Agency Login
          </Link>
          <Link
            href="http://localhost:3002"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Resident Portal
          </Link>
        </motion.div>
      </div>

      {/* Decorative dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
        className="mt-20 relative w-full max-w-5xl mx-auto px-4"
      >
        <div className="aspect-[16/9] rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden glass-card flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <p className="text-white/20 text-sm tracking-widest uppercase z-0 font-mono">
            Interactive Dashboard Preview
          </p>
        </div>
      </motion.div>
    </section>
  );
}
