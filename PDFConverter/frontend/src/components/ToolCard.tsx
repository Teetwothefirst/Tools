import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  badge?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  badge,
}) => {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative group h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md hover:border-slate-700 hover:bg-slate-900/90 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-lg shadow-black/40`}>
            <Icon className="h-7 w-7" />
          </div>

          {badge && (
            <span className="rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-400">
              {badge}
            </span>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-2">
            <span>{title}</span>
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-400" />
          </h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};
