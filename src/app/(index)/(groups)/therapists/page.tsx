"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NavbarLanding from "@/components/navbar/navbar-landing";
import FooterDashboard from "@/components/footer/footer-landing";

const TherapistsPage = () => {
  // Benefits data
  const benefits = [
    {
      title: "Automate Note-Taking",
      description: "Focus on your client instead of documentation. Our AI automatically captures and organizes session notes."
    },
    {
      title: "Track Client Progress",
      description: "Visualize client improvement over time with intuitive dashboards and trend analysis."
    },
    {
      title: "Enhance Client Engagement",
      description: "Provide personalized journaling prompts and exercises between sessions to maintain momentum."
    },
    {
      title: "Secure & HIPAA Compliant",
      description: "Rest easy knowing all client data is protected with enterprise-grade security and full compliance."
    },
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      features: [
        "Up to 15 clients",
        "Basic AI session summaries",
        "Client portal access",
        "Secure messaging",
      ],
      recommended: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      features: [
        "Up to 30 clients",
        "Advanced AI insights",
        "Progress tracking",
        "Custom journaling prompts",
        "Priority support",
      ],
      recommended: true,
    },
    {
      name: "Practice",
      price: "$199",
      period: "per month",
      features: [
        "Unlimited clients",
        "Full practice management",
        "Advanced analytics",
        "Team collaboration tools",
        "White-label options",
        "Dedicated account manager",
      ],
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavbarLanding />

      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#F8FBFC] to-white py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#146C94] mb-6">
              Transform Your Therapy Practice with AI
            </h1>
            <p className="text-xl text-[#146C94]/70 max-w-3xl mx-auto mb-8">
              Spend less time on paperwork and more time connecting with your clients. 
              Our AI-powered platform helps you deliver better care while growing your practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-therapist">
                <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="border-[#AFD3E2] text-[#146C94] hover:bg-[#AFD3E2]/20 px-8 py-6 text-lg">
                  See Live Demo
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-[#146C94]/60 text-sm">
              No credit card required. 14-day free trial.
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Built for Modern Mental Health Professionals
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Our platform helps you deliver exceptional care while streamlining your practice operations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-[#F8FBFC] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#146C94] mb-3">{benefit.title}</h3>
                  <p className="text-[#146C94]/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial section removed as requested */}

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Choose the plan that&apos;s right for your practice. All plans include our core AI features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`rounded-xl p-8 ${
                    plan.recommended 
                      ? 'bg-[#146C94] text-white relative' 
                      : 'bg-[#F8FBFC] text-[#146C94]'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#AFD3E2] text-[#146C94] px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <h3 className={`text-2xl font-bold ${
                    plan.recommended ? 'text-white' : 'text-[#146C94]'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className={`${
                      plan.recommended ? 'text-white/70' : 'text-[#146C94]/70'
                    }`}>
                      {' '}{plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className={`${
                          plan.recommended ? 'text-[#AFD3E2]' : 'text-[#146C94]'
                        }`}>✓</span>
                        <span className={`${
                          plan.recommended ? 'text-white/90' : 'text-[#146C94]/90'
                        }`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup-therapist">
                    <Button 
                      className={`w-full ${
                        plan.recommended 
                          ? 'bg-white text-[#146C94] hover:bg-[#F8FBFC]' 
                          : 'bg-[#AFD3E2] text-[#146C94] hover:bg-[#AFD3E2]/80'
                      }`}
                    >
                      Choose Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8 text-[#146C94]/70">
              Need a custom solution? <Link href="/contact" className="text-[#146C94] underline">Contact us</Link> for enterprise pricing.
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#F8FBFC] py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#146C94] mb-4">
              Ready to elevate your practice?
            </h2>
            <p className="mt-2 text-xl text-[#146C94]/80 mb-8">
              Join our community of leading therapists and unlock innovative tools and insights.
            </p>
            <Link href="/signup-therapist">
              <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 py-6 text-lg">
                Start Your 14-Day Free Trial
              </Button>
            </Link>
            <p className="mt-4 text-[#146C94]/70">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#146C94] mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">Is TherapyAI HIPAA compliant?</h3>
                <p className="text-[#146C94]/70">Yes, TherapyAI is fully HIPAA compliant. We implement enterprise-grade security measures including end-to-end encryption, secure data storage, and regular security audits.</p>
              </div>
              
              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">How accurate is the AI note-taking?</h3>
                <p className="text-[#146C94]/70">Our AI achieves over 95% accuracy in session documentation. You&apos;ll always have the opportunity to review and edit AI-generated notes before finalizing them.</p>
              </div>
              
              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">Can I integrate TherapyAI with my existing practice management software?</h3>
                <p className="text-[#146C94]/70">Yes, TherapyAI integrates with most popular practice management systems including SimplePractice, TherapyNotes, and others through our secure API.</p>
              </div>
              
              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">What if my clients don&apos;t want to use technology?</h3>
                <p className="text-[#146C94]/70">TherapyAI is designed to be flexible. You can use the AI note-taking features without requiring any client participation, or fully engage clients who are comfortable with technology.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterDashboard />
    </div>
  );
};

export default TherapistsPage;