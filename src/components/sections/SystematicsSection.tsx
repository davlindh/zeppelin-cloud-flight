import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Wrench, Megaphone, ArrowRight } from 'lucide-react';

interface SystemStep {
  icon: React.ReactNode;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  bgColor: string;
}

const systemSteps: SystemStep[] = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Kunskapsdomänen',
    shortTitle: 'Lär',
    description: 'Vi analyserar och validerar kunskap – från forskning till lokala berättelser – för att bygga en solid grund.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    icon: <Wrench className="h-8 w-8" />,
    title: 'Operationella Domänen',
    shortTitle: 'Bygg',
    description: 'Vi översätter insikter till handling – konkreta prototyper, projekt och lösningar som kan testas i verkligheten.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  {
    icon: <Megaphone className="h-8 w-8" />,
    title: 'Kommunikationsdomänen',
    shortTitle: 'Berätta',
    description: 'Vi skapar berättelser som inspirerar och överbryggar klyftan mellan experter, beslutsfattare och allmänhet.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
];

export const SystematicsSection: React.FC = () => {
  return (
    <section id="systematik" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-gray-800">
              Från idé till verklighet
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vår trestegsmodell guidar varje projekt genom en strukturerad resa som säkerställer kvalitet och genomslagskraft.
            </p>
          </motion.div>
        </div>

        {/* Visual Process Flow */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop: Horizontal Flow */}
          <div className="hidden md:flex items-stretch gap-4">
            {systemSteps.map((step, index) => (
              <React.Fragment key={step.shortTitle}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex-1"
                >
                  <div className={`h-full p-6 rounded-2xl border-2 ${step.bgColor} hover:shadow-lg transition-all duration-300`}>
                    {/* Step Number */}
                    <div className={`inline-flex items-center gap-2 ${step.color} mb-4`}>
                      <span className="text-sm font-bold opacity-60">0{index + 1}</span>
                      <span className="text-2xl font-bold">{step.shortTitle}</span>
                    </div>
                    
                    {/* Icon */}
                    <div className={`mb-4 ${step.color}`}>
                      {step.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow between steps */}
                {index < systemSteps.length - 1 && (
                  <div className="flex items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.15 }}
                    >
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile: Vertical Flow */}
          <div className="md:hidden space-y-4">
            {systemSteps.map((step, index) => (
              <React.Fragment key={step.shortTitle}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={`p-5 rounded-xl border-2 ${step.bgColor}`}>
                    <div className="flex items-start gap-4">
                      {/* Icon & Number */}
                      <div className={`flex-shrink-0 ${step.color}`}>
                        <div className="text-xs font-bold opacity-60 mb-1">0{index + 1}</div>
                        {step.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className={`text-xl font-bold ${step.color} mb-1`}>
                          {step.shortTitle}
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow between steps (mobile) */}
                {index < systemSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: 0.2 + index * 0.1 }}
                      className="rotate-90"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">
                Denna process vägleder varje projekt på Zeppel Inn
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
