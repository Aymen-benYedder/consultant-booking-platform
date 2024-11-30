import React, { useContext } from 'react';
import { AppContext } from '../AppContext';

const Dashboard = () => {
  const { user, consultants, services } = useContext(AppContext);

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Your Profile</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Role:</span> {user?.role}</p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Available Consultants:</span> {consultants?.length}</p>
              <p><span className="font-medium">Available Services:</span> {services?.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services?.map((service) => (
            <div key={service._id} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-2">{service.description}</p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Duration:</span> {service.sessionDuration} minutes
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Price:</span> ${service.pricePerSession}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Our Consultants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultants?.map((consultant) => (
            <div key={consultant._id} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                {consultant.avatar && (
                  <img
                    src={consultant.avatar}
                    alt={consultant.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{consultant.name}</h3>
                  <p className="text-gray-600">{consultant.specialty}</p>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{consultant.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
