"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NavbarLanding from "@/components/navbar/navbar-landing";
import FooterLanding from "@/components/footer/footer-landing";

const AboutPage = () => {
  // Team members data with added image paths
  const teamMembers = [
    {
      name: "Timothy Shaw",
      role: "Clinical Director",
      bio: "Clinical psychologist with 15+ years of experience and a passion for making therapy more accessible.",
      image: "/images/avatars/team/1.jpeg"
    },
    {
      name: "Hunter Todd",
      role: "Director of Therapist Relations",
      bio: "Former healthcare technology executive with a mission to improve mental healthcare through innovation.",
      image: "/images/avatars/team/2.jpeg"
    },
    {
      name: "Pavel Stepanov",
      role: "Head of AI Research",
      bio: "PhD in AI and psychology with expertise in natural language processing for therapeutic applications.",
      image: "/images/avatars/team/3.jpeg"
    },
  ];

  // Values data
  const values = [
    {
      title: "Compassionate Care",
      description: "We believe technology should enhance, not replace, the human connection at the heart of therapy."
    },
    {
      title: "Accessibility",
      description: "We're committed to making quality mental healthcare available to everyone who needs it."
    },
    {
      title: "Innovation",
      description: "We continuously explore new technologies to improve the therapy experience for all."
    },
    {
      title: "Excellence",
      description: "We maintain the highest standards of clinical quality, security, and ethical practice."
    },
    {
      title: "Education",
      description: "We believe in empowering both therapists and clients with knowledge and tools."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarLanding />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#FFFFFF] py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#146C94] mb-6">
              Our Mission to Transform<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#146C94] via-[#AFD3E2] to-[#146C94]">
                Mental Healthcare
              </span>
            </h1>
            <p className="text-xl text-[#146C94]/70 max-w-3xl mx-auto mb-8">
              TherapyAI was founded with a simple yet powerful mission: to make quality mental healthcare 
              more accessible, effective, and personalized through the thoughtful application of technology.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Our Story
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                TherapyAI began as a collaborative effort between clinicians, technologists, and patients.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-[#146C94]/80 mb-4">
                TherapyAI was born from a shared frustration: despite advances in healthcare technology, the therapeutic process remained largely unchanged for decades, with therapists spending valuable time on documentation rather than connection.
              </p>
              <p className="text-[#146C94]/80 mb-4">
                In 2022, our founders – a team of therapists, technologists, and patients – came together with a vision: to create a platform that would empower both therapists and clients while preserving the essential human relationship at the heart of therapy.
              </p>
              <p className="text-[#146C94]/80 mb-4">
                After years of development and close collaboration with mental health professionals, we launched TherapyAI with a commitment to enhancing the therapeutic experience, not replacing it. Today, we&apos;re proud to support thousands of therapist-client relationships across the country.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-[#F8FBFC]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Our Values
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                These core principles guide everything we do at TherapyAI.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-[#F8FBFC] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#146C94] mb-3">{value.title}</h3>
                  <p className="text-[#146C94]/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section - More compact three column layout */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                Led by experts in mental health, technology, and healthcare innovation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-[#F8FBFC] rounded-xl overflow-hidden shadow-sm">
                  {/* Keeping original image proportions */}
                  <div className="relative w-full h-64">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-xl"
                    />
                  </div>
                  {/* More compact content area */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#146C94] mb-1">{member.name}</h3>
                    <p className="text-sm text-[#146C94]/90 font-medium mb-2">{member.role}</p>
                    <p className="text-xs text-[#146C94]/70">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-[#F8FBFC] to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#146C94] mb-4">
                Our Impact
              </h2>
              <p className="text-lg text-[#146C94]/70 max-w-2xl mx-auto">
                We&apos;re proud of the difference we&apos;re making in mental healthcare.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-[#F8FBFC] rounded-xl p-8">
                <h3 className="text-4xl font-bold text-[#146C94] mb-2">5,000+</h3>
                <p className="text-[#146C94]/70">Therapists on our platform</p>
              </div>
              
              <div className="bg-[#F8FBFC] rounded-xl p-8">
                <h3 className="text-4xl font-bold text-[#146C94] mb-2">50,000+</h3>
                <p className="text-[#146C94]/70">Patients helped</p>
              </div>
              
              <div className="bg-[#F8FBFC] rounded-xl p-8">
                <h3 className="text-4xl font-bold text-[#146C94] mb-2">25%</h3>
                <p className="text-[#146C94]/70">Average improvement in therapist efficiency</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-[#146C94]/80 max-w-3xl mx-auto mb-6">
                Beyond the numbers, we measure our success by the quality of therapeutic relationships we help facilitate and the improved mental health outcomes for patients across the country.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-[#F8FBFC] py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#146C94] mb-4">
              Join Us in Our Mission
            </h2>
            <p className="mt-2 text-xl text-[#146C94]/80 mb-8">
              Whether you&apos;re a mental health professional or someone seeking support, be part of the future of therapy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-therapist">
                <Button className="bg-[#146C94] hover:bg-[#19A7CE] text-white px-8 py-6 text-lg">
                  For Therapists
                </Button>
              </Link>
              <Link href="/signup-patient">
                <Button className="bg-[#AFD3E2] text-[#146C94] hover:bg-[#AFD3E2]/80 px-8 py-6 text-lg">
                  For Patients
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterLanding />
    </div>
  );
};

export default AboutPage;