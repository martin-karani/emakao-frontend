"use client";

import { motion } from "framer-motion";
import { Banknote, Home, ShieldCheck, Wrench } from "lucide-react";

const features = [
  {
    title: "Automated Reconciliation",
    description: "Connect your bank feeds and let our engine automatically match incoming payments to tenant invoices.",
    icon: Banknote,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Portfolio Management",
    description: "Track units, occupancy rates, and lease expirations across all your properties from a single dashboard.",
    icon: Home,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Smart Work Orders",
    description: "Tenants report issues via the mobile app. Dispatch vendors, track progress, and manage invoices seamlessly.",
    icon: Wrench,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
  },
  {
    title: "Fine-Grained Access",
    description: "Assign specific roles to your staff. Control exactly who can view financial data or approve new leases.",
    icon: ShieldCheck,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

export function Features() {
  return (
    <section className="py-24 relative z-10">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-gradient bg-gradient-to-r from-blue-400 to-emerald-400">scale</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Say goodbye to spreadsheets and disjointed tools. eMakao unifies your entire property management workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-colors"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-32 h-32" />
              </div>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${feature.bg} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
