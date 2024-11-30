import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion';
import ConsultantModal from '../components/Modals/consultant-modal/ConsultantModal';
import { useApi } from '../hooks/useApi';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  // Fetch consultants
  const { data: consultants, error: consultantsError } = useApi('/consultants');

  // Randomly select a consultant for the service
  const selectRandomConsultant = () => {
    if (consultants && consultants.length > 0) {
      const randomIndex = Math.floor(Math.random() * consultants.length);
      return consultants[randomIndex];
    }
    return null;
  };

  const handleServiceClick = (service) => {
    const consultant = selectRandomConsultant();
    setSelectedService(service);
    setSelectedConsultant(consultant);
    setIsModalOpen(true);
  };

  const services = [
    {
      id: 1,
      title: 'Business Strategy',
      description: 'Expert guidance on business growth, market entry, and competitive positioning',
      icon: '💼',
      categories: ['Strategic Planning', 'Market Analysis', 'Growth Strategy']
    },
    {
      id: 2,
      title: 'Financial Advisory',
      description: 'Professional advice on financial planning, investment, and risk management',
      icon: '📊',
      categories: ['Investment Planning', 'Risk Management', 'Financial Analysis']
    },
    {
      id: 3,
      title: 'Technology Consulting',
      description: 'Technical expertise for digital transformation and technology implementation',
      icon: '💻',
      categories: ['Digital Transformation', 'Tech Strategy', 'System Architecture']
    },
    {
      id: 4,
      title: 'Marketing & Sales',
      description: 'Strategic marketing solutions and sales optimization techniques',
      icon: '📈',
      categories: ['Digital Marketing', 'Sales Strategy', 'Brand Development']
    },
    {
      id: 5,
      title: 'Legal Consulting',
      description: 'Expert legal advice and compliance guidance for businesses',
      icon: '⚖️',
      categories: ['Corporate Law', 'Compliance', 'Contract Review']
    },
    {
      id: 6,
      title: 'Operations Management',
      description: 'Optimize business operations and improve organizational efficiency',
      icon: '⚙️',
      categories: ['Process Optimization', 'Supply Chain', 'Quality Management']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Expert Consulting Services for
            <span className="block mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Every Business Need
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Connect with industry-leading consultants who can help transform your business
            and drive success
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleServiceClick(service)}
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.categories.map((category, catIndex) => (
                    <span
                      key={catIndex}
                      className="inline-block px-3 py-1 text-sm text-sky-600 bg-sky-50 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Service',
                description: 'Select the type of consulting service you need'
              },
              {
                step: '02',
                title: 'Match Expert',
                description: 'Get matched with the perfect consultant for your needs'
              },
              {
                step: '03',
                title: 'Book Session',
                description: 'Schedule a convenient time for your consultation'
              },
              {
                step: '04',
                title: 'Get Results',
                description: 'Receive expert guidance and implement solutions'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="inline-block">
                  <span className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-16 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Transform Your Business?
                  </h2>
                  <p className="text-white/90 mb-8">
                    Get started with our expert consultants today and take your business to the next level
                  </p>
                  <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition-colors">
                    Book a Consultation
                  </button>
                </div>
                <div className="mt-12 lg:mt-0">
                  <dl className="space-y-6">
                    {[
                      { stat: '24/7', label: 'Expert Availability' },
                      { stat: '100%', label: 'Satisfaction Guaranteed' },
                      { stat: 'Global', label: 'Network of Experts' }
                    ].map((item, index) => (
                      <div key={index} className="flex">
                        <dt className="text-2xl font-bold text-white">{item.stat}</dt>
                        <dd className="ml-3 text-white/90">{item.label}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Consultant Modal */}
      <ConsultantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
          setSelectedConsultant(null);
        }}
        consultantId={selectedConsultant?._id}
        serviceId={selectedService?.id}
        serviceName={selectedService?.title}
      />
    </div>
  );
};

export default Services;
