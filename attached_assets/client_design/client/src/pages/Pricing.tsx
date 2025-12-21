import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Crown, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      description: "Essential tools for casual users",
      price: "0",
      features: [
        "Access to basic tools",
        "5 files per day",
        "Standard processing speed",
        "Ads supported",
        "Files stored for 1 hour"
      ],
      notIncluded: [
        "Bulk processing",
        "API access",
        "Priority support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      description: "For power users and creators",
      price: isAnnual ? "9" : "12",
      features: [
        "Access to all 50+ tools",
        "Unlimited file processing",
        "2x Faster processing speed",
        "No ads",
        "Files stored for 24 hours",
        "Bulk processing",
        "Priority email support"
      ],
      notIncluded: [
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      description: "For small teams and businesses",
      price: isAnnual ? "29" : "39",
      features: [
        "Everything in Pro",
        "5 Team members",
        "Centralized billing",
        "API Access (500 calls/mo)",
        "Dedicated account manager",
        "SSO Authentication"
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Abstract BG */}
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 -z-10" />

        <div className="container mx-auto px-6 text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Simple pricing for <br />
            <span className="text-primary">powerful tools.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10">
            Choose the plan that fits your needs. No hidden fees. Cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <Switch 
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-semibold ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-1 font-bold">SAVE 25%</span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`
                  relative bg-white rounded-3xl p-8 border transition-all duration-300
                  ${plan.popular 
                    ? 'border-primary shadow-2xl shadow-primary/10 scale-105 z-10' 
                    : 'border-slate-200 shadow-xl shadow-slate-200/50 hover:border-slate-300'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-primary/20">
                    <Crown className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-2 h-10">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                  <span className="text-slate-400 font-medium">/month</span>
                </div>

                <Button 
                  className={`w-full h-12 rounded-xl font-semibold mb-8 ${plan.popular ? 'shadow-lg shadow-primary/25' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, f) => (
                    <div key={f} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      {feature}
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, f) => (
                    <div key={f} className="flex items-start gap-3 text-sm text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-slate-400" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise / Trust Section */}
        <div className="container mx-auto px-6 border-t border-slate-200 pt-20 text-center">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by teams at</h4>
           <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
              <div className="text-xl font-bold font-serif italic">Acme Corp</div>
              <div className="text-xl font-bold tracking-tighter">GlobalBank</div>
              <div className="text-xl font-bold font-mono">dev.co</div>
              <div className="text-xl font-bold">Starlight</div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}