"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Clock, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Rotate featured highlights
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Monitor your deliveries with live GPS tracking and instant updates"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Lightning-fast delivery times with optimized routing algorithms"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Your packages are safe with our verified delivery partners"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "50K+", label: "Deliveries Completed" },
    { number: "99.9%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>

        <div className={`relative z-10 page-container text-center py-20 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-pulse">
              Delivery Tracker
            </h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Truck className="w-8 h-8 text-blue-500 animate-bounce" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  ></div>
                ))}
              </div>
              <Package className="w-8 h-8 text-green-500 animate-bounce delay-300" />
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of logistics with real-time tracking, 
            <span className="text-blue-600 font-semibold"> instant notifications</span>, and 
            <span className="text-purple-600 font-semibold"> seamless delivery management</span>
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/vendor/login" 
                  className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg min-w-64">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Package className="w-6 h-6" />
                Vendor Portal
              </div>
            </Link>
            
            <Link href="/delivery/login" 
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg min-w-64">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Truck className="w-6 h-6" />
                Delivery Partner
              </div>
            </Link>
            
            <Link href="/track/enter-order-id" 
                  className="group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg min-w-64">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                Track Order
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm py-16">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="page-container">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                  activeFeature === index ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50' : 'border-transparent'
                }`}
              >
                <div className={`text-blue-500 mb-4 transition-colors duration-300 ${
                  activeFeature === index ? 'text-purple-500' : ''
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="page-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Delivery Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and partners who trust our platform
          </p>
          <Link href="/track/enter-order-id" 
                className="group bg-white text-blue-600 font-bold py-4 px-8 rounded-xl text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-3">
            <Zap className="w-6 h-6" />
            Start Tracking Now
            <div className="group-hover:translate-x-1 transition-transform duration-300">→</div>
          </Link>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-8 h-8 text-blue-400" />
                Delivery Tracker
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing logistics with cutting-edge technology and exceptional service. 
                Your trusted partner for all delivery needs.
              </p>
            </div>
        </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Delivery Tracker. All rights reserved. 
              <span className="ml-2">Built with ❤️ for better logistics</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}