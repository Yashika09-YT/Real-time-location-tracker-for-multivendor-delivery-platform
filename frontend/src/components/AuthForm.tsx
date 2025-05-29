"use client";
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import {deliveryPartnerLogin, deliveryPartnerSignup , vendorLogin, vendorSignup } from '@/services/api';

interface AuthFormProps {
  mode: 'login' | 'signup';
  userType: 'vendor' | 'deliveryPartner';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, userType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const getApiAction = () => {
    if (mode === 'login' && userType === 'vendor') return vendorLogin;
    if (mode === 'signup' && userType === 'vendor') return vendorSignup;
    if (mode === 'login' && userType === 'deliveryPartner') return deliveryPartnerLogin;
    if (mode === 'signup' && userType === 'deliveryPartner') return deliveryPartnerSignup;
    throw new Error('Invalid mode or userType');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload: any = { email, password };
    if (mode === 'signup') {
      payload.name = name;
    }

    try {
      const apiAction = getApiAction();
      const response = await apiAction(payload);
      login(response.data.token, response.data.user);

      if (userType === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/delivery/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `An error occurred during ${mode}.`);
      console.error(`${mode} error:`, err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1a202c'
      }}>
        {mode === 'login' ? ' Login' : 'Sign Up'} as {userType === 'vendor' ? 'Vendor' : 'Delivery Partner'}
      </h2>
      
      {error && (
        <div style={{ 
          color: '#e53e3e', 
          fontSize: '0.9rem', 
          marginBottom: '1.5rem', 
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(254, 226, 226, 0.9)',
          borderRadius: '12px',
          border: '2px solid rgba(245, 101, 101, 0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {mode === 'signup' && (
          <div style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label 
              htmlFor="name" 
              style={{ 
                display: 'block', 
                marginBottom: '0.7rem', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '1rem'
              }}
            >
               Name / Company Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your name or company name"
              style={{ 
                opacity: isLoading ? 0.6 : 1,
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '0.7rem', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '1rem'
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your email address"
            style={{ 
              opacity: isLoading ? 0.6 : 1,
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '2.5rem', width: '100%' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '0.7rem', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '1rem'
            }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your password"
            style={{ 
              opacity: isLoading ? 0.6 : 1,
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          style={{ 
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '1.1rem',
            fontWeight: '700'
          }}
        >
          {isLoading ? ' Processing...' : (mode === 'login' ? ' Login' : 'Sign Up')}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;