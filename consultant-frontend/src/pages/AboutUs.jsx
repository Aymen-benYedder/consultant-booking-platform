import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { number: '10K+', label: 'Active Consultants' },
    { number: '50K+', label: 'Successful Sessions' },
    { number: '95%', label: 'Client Satisfaction' },
    { number: '120+', label: 'Specializations' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <motion.section 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6"
            variants={fadeIn}
          >
            Empowering Success Through
            <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent"> Expert Guidance</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 text-center max-w-3xl mx-auto"
            variants={fadeIn}
          >
            Connect with industry-leading consultants on-demand and transform your vision into reality
          </motion.p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-sky-600">{stat.number}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                We're revolutionizing the consulting industry by making expert guidance accessible to everyone. Our platform connects you with top-tier consultants across various fields, enabling real-time problem-solving and strategic planning.
              </p>
              <p className="text-gray-600">
                Whether you're a startup founder, business executive, or individual seeking professional advice, our platform provides the expertise you need, when you need it.
              </p>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
                  alt="Team collaboration"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'On-Demand Expertise',
                description: 'Connect with experts instantly, any time of day',
                icon: '🎯'
              },
              {
                title: 'Verified Professionals',
                description: 'All consultants are thoroughly vetted and certified',
                icon: '✓'
              },
              {
                title: 'Secure Platform',
                description: 'End-to-end encrypted communications and secure payments',
                icon: '🔒'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-12 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have accelerated their success through our platform
            </p>
            <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition-colors">
              Get Started Today
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
