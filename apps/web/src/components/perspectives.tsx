"use client";

import { motion } from "framer-motion";
import { Smartphone, Building } from "lucide-react";

export function Perspectives() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Agency Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-2">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Built for Agencies</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Managing hundreds of units shouldn't require a dozen different subscriptions. Our staff workspace gives you complete visibility over occupancy, arrears, and maintenance requests in real-time.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Multi-property portfolio views
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Bulk invoice generation
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Staff role-based access control
              </li>
            </ul>
          </motion.div>

          {/* Resident Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 relative"
          >
            {/* Visual Phone Mockup */}
            <div className="relative mx-auto w-[280px] h-[580px] rounded-[3rem] border-[8px] border-white/10 glass-card p-4 overflow-hidden shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-6 bg-white/10 blur-xl" />
              <div className="w-full h-full rounded-2xl bg-black/50 border border-white/5 flex flex-col p-4 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs text-gray-400">Welcome home,</p>
                    <p className="font-semibold">Jane Doe</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 mb-6">
                  <p className="text-sm text-gray-300 mb-1">Current Balance</p>
                  <p className="text-2xl font-bold">KES 0.00</p>
                </div>

                <div className="space-y-3">
                  <div className="h-16 rounded-xl bg-white/5 border border-white/5" />
                  <div className="h-16 rounded-xl bg-white/5 border border-white/5" />
                  <div className="h-16 rounded-xl bg-white/5 border border-white/5" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-8 top-32 glass-card px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/30"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium">Rent Paid via M-Pesa</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
