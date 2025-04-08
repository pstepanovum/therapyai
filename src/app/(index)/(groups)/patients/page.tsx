/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Brain, Clock, Heart, MessageCircle, Shield, Star, FileText } from "lucide-react";
import NavbarWaitlist from "@/components/navbar/navbar-landing";
import FooterLanding from "@/components/footer/footer-landing";

const PatientsPage = () => {
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Easy Scheduling",
      description: "Book appointments with your therapist at times that work best for you"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Mental Health Resources",
      description: "Access a library of helpful resources and exercises between sessions"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Secure Messaging",
      description: "Communicate safely with your therapist through our encrypted platform"
    }
  ];

  const testimonials = [
    {
      quote: "TherapyAI has made managing my mental health so much easier. I can message my therapist between sessions and track my progress over time.",
      author: "Sarah K.",
      title: "TherapyAI Patient"
    },
    {
      quote: "I was hesitant about virtual therapy, but this platform made the transition seamless. The journaling prompts have been especially helpful for me.",
      author: "Marcus T.",
      title: "TherapyAI Patient"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavbarWaitlist />

      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AFD3E2] mb-6">
              <Star className="w-4 h-4 text-[#146C94]" />
              <span className="text-[#146C94] text-sm font-medium">Your Mental Health Journey</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#146C94] mb-6">
              <span className="text-[#146C94]">Your Journey to</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#146C94] via-[#AFD3E2] to-[#146C94]">
                Better Mental Health
              </span>
            </h1>
            <p className="text-xl text-[#146C94]/70 max-w-3xl mx-auto mb-8">
              Connect with licensed therapists, schedule sessions at your convenience, and take control of your mental wellness journey with our secure and supportive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-patient">
                <Button className="bg-[#146C94] text-white hover:bg-[#19A7CE] px-8 py-6 text-lg">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/learn-more">
                <Button variant="outline" className="border-[#AFD3E2] text-[#146C94] hover:bg-[#AFD3E2]/20 px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-[#146C94]/60 text-sm">
              No credit card required. 14-day free trial.
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Features Designed for Your Wellness Journey
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Our platform provides the tools you need to engage with therapy in a way that works for you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-[#F8FBFC] rounded-xl p-6"
                >
                  <div className="h-12 w-12 bg-[#146C94]/10 rounded-lg flex items-center justify-center text-[#146C94] mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#146C94] mb-3">{feature.title}</h3>
                  <p className="text-[#146C94]/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                We&apos;re committed to making mental healthcare accessible, convenient, and effective.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="w-6 h-6 text-[#146C94] mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-[#146C94]">Flexible Scheduling</h3>
                </div>
                <p className="text-[#146C94]/70 ml-9">Book sessions that fit your schedule, with easy rescheduling options when life gets busy.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-6 h-6 text-[#146C94] mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-[#146C94]">Secure & Private</h3>
                </div>
                <p className="text-[#146C94]/70 ml-9">Your privacy is our priority with end-to-end encrypted sessions and HIPAA-compliant systems.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#146C94] mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-[#146C94]">Personalized Care</h3>
                </div>
                <p className="text-[#146C94]/70 ml-9">Get matched with therapists who understand your unique needs and concerns.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-6 h-6 text-[#146C94] mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-[#146C94]">Session Insights</h3>
                </div>
                <p className="text-[#146C94]/70 ml-9">Receive helpful summaries and insights from your therapy sessions to reinforce your progress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                How It Works
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Getting started with TherapyAI is simple and straightforward.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-[#F8FBFC] rounded-xl p-6">
                  <div className="h-8 w-8 bg-[#146C94] rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#146C94] mb-2">Sign Up</h3>
                    <p className="text-[#146C94]/70">Complete a brief questionnaire about your needs and preferences to help us match you with the right therapist.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-[#F8FBFC] rounded-xl p-6">
                  <div className="h-8 w-8 bg-[#146C94] rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#146C94] mb-2">Get Matched</h3>
                    <p className="text-[#146C94]/70">We&apos;ll connect you with therapists who specialize in your areas of concern and fit your preferences.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-[#F8FBFC] rounded-xl p-6">
                  <div className="h-8 w-8 bg-[#146C94] rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#146C94] mb-2">Schedule Your First Session</h3>
                    <p className="text-[#146C94]/70">Choose a time that works for you and begin your mental health journey with your selected therapist.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-[#F8FBFC] rounded-xl p-6">
                  <div className="h-8 w-8 bg-[#146C94] rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">4</div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#146C94] mb-2">Ongoing Support</h3>
                    <p className="text-[#146C94]/70">Receive AI-powered insights, journaling prompts, and resources between sessions to support your progress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 ">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                What Our Patients Say
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Hear from people who have transformed their mental health journey with TherapyAI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-[#F8FBFC] rounded-xl p-6"
                >
                  <div className="flex items-center gap-1 text-[#146C94] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-[#146C94]/80 italic mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-[#146C94]">{testimonial.author}</p>
                    <p className="text-[#146C94]/60 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
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
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">Is online therapy as effective as in-person therapy?</h3>
                <p className="text-[#146C94]/70">Research shows that online therapy can be just as effective as in-person therapy for many conditions. Our platform enhances the experience with additional tools and resources to support your progress between sessions.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">Is my information kept private?</h3>
                <p className="text-[#146C94]/70">Absolutely. TherapyAI is fully HIPAA compliant and uses end-to-end encryption for all communications. Your privacy and confidentiality are our top priorities.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">How much does therapy cost through your platform?</h3>
                <p className="text-[#146C94]/70">Therapy costs vary based on your therapist&apos;s rates and your insurance coverage. Many of our therapists accept insurance, and we offer transparent pricing before you book.</p>
              </div>

              <div className="bg-[#F8FBFC] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-2">Can I switch therapists if I&apos;m not satisfied?</h3>
                <p className="text-[#146C94]/70">Yes, finding the right therapist is important. If you feel you need to switch, you can easily do so through our platform with no questions asked.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#F8FBFC] py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#146C94] mb-4">
              Ready to start your mental health journey?
            </h2>
            <p className="mt-2 text-xl text-[#146C94]/80 mb-8">
              Join our supportive community and connect with therapists who can help you thrive.
            </p>
            <Link href="/signup-patient">
              <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 py-6 text-lg">
                Get Started Today
              </Button>
            </Link>
            <p className="mt-4 text-[#146C94]/70">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>
      </main>

      <FooterLanding />
    </div>
  );
};

export default PatientsPage;