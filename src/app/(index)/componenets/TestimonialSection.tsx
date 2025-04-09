import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const FeaturesSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSecondVideoPlaying, setSecondVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLIFrameElement | null>(null);
  const secondVideoRef = useRef<HTMLIFrameElement | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const features = [
    {
      title: 'AI-Powered Session Summary',
      description:
        'Get comprehensive session summaries automatically. Remember the issues you discussed, the progress made, and the next steps.',
      image: '/images/mockup/1.jpg',
    },
    {
      title: 'Personalized Journaling Prompts',
      description: 'Dive into your mental health journey with personalized journaling prompts that help you reflect and grow.',
      image: '/images/mockup/2.jpg',
    },
    {
      title: 'Discover Hidden Patterns',
      description: 'Reveal the deeper themes in your mental health journey. Understand your progress and growth over time.',
      image: '/images/mockup/3.jpg',
    },
  ];

  return (
    <motion.section 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }} 
      className="w-full py-20 px-4 md:px-12 lg:px-24 bg-[#FFFFFF]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AFD3E2]/30 mb-6">
            <span className="text-[#146C94] text-sm font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#146C94] mb-6">
            Transform Your Therapy Practice
          </h2>
          
          <p className="text-[#146C94]/70 text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with intuitive tools to enhance your mental health experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              variants={fadeInUp} 
              custom={index} 
              className="bg-white rounded-2xl overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image 
                  src={feature.image} 
                  alt={feature.title} 
                  fill 
                  className="object-cover" 
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#146C94] mb-3">{feature.title}</h3>
                <p className="text-[#146C94]/70 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* YouTube Video Section */}
        <motion.div 
          variants={fadeInUp} 
          className="mt-20"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AFD3E2]/30 mb-6">
              <span className="text-[#146C94] text-sm font-medium">See It In Action</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-[#146C94] mb-4">
              Watch How TherapyAI Works
            </h2>
            
            <p className="text-[#146C94]/70 text-lg max-w-2xl mx-auto">
              See how our platform helps therapists stay present during sessions while capturing valuable insights.
            </p>
          </div>
          
          {/* Two-column video layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* First Video */}
            <div className="rounded-2xl overflow-hidden">
              <div className="relative aspect-video w-full cursor-pointer group" 
                   onClick={() => {
                     setIsVideoPlaying(true);
                     if (videoRef.current) videoRef.current.focus();
                   }}>
                <Image
                  src="/images/video/1.jpg"
                  alt="TherapyAI Demo Video"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-[#146C94]/30 group-hover:bg-[#146C94]/20 transition-all duration-300 flex items-center justify-center rounded-2xl">
                  <Play className="h-16 w-16 text-white p-4" />
                </div>
                {isVideoPlaying && (
                  <iframe
                    ref={videoRef}
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/PLc357sQ4pc?autoplay=1"
                    title="TherapyAI Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 rounded-2xl aspect-video"
                  ></iframe>
                )}
              </div>
            </div>
            
            {/* Second Video */}
            <div className="rounded-2xl overflow-hidden">
              <div className="relative aspect-video w-full cursor-pointer group"
                   onClick={() => {
                     setSecondVideoPlaying(true);
                     if (secondVideoRef.current) secondVideoRef.current.focus();
                   }}>
                <Image
                  src="/images/video/2.jpg"
                  alt="TherapyAI Features Video"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-[#146C94]/30 group-hover:bg-[#146C94]/20 transition-all duration-300 flex items-center justify-center rounded-2xl">
                    <Play className="h-16 w-16 text-white p-4" />
                </div>
                {isSecondVideoPlaying && (
                  <iframe
                    ref={secondVideoRef}
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/T7a7xgs7FpA?autoplay=1"
                    title="TherapyAI Features Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 rounded-2xl aspect-video"
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div variants={fadeInUp} className="mt-20 text-center py-10 px-6 rounded-2xl bg-[#AFD3E2]/20">
          <div className="inline-flex items-center justify-center p-4 mb-4">
            <Image 
              src="/logo/therapyAI-black.png" 
              alt="TherapyAI Logo" 
              width={1920} 
              height={1080} 
              className="h-8 w-auto" 
            />
          </div>
          
          <h3 className="text-2xl font-semibold text-[#146C94] mb-3">
            Trusted by Mental Health Professionals
          </h3>
          
          <p className="text-[#146C94]/70 max-w-2xl mx-auto mb-6">
            Join thousands of mental health professionals who are already using TherapyAI to provide better care for their patients.
          </p>
          
          <button className="bg-[#AFD3E2] text-[#146C94] px-8 py-3 rounded-xl font-medium hover:bg-[#146C94] hover:text-white transition-colors duration-300">
            Start Your Free Trial
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;