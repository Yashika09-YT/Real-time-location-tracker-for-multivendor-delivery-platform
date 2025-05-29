"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); 
  };

  return (
    <nav>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800',
          marginRight: 'auto',
          textDecoration: 'none',
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚚 Delivery Tracker
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isAuthenticated && user ? (
          <>
            <span style={{ 
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Welcome, <strong>{user.name}</strong> ({user.role})
            </span>
            {user.role === 'vendor' && (
              <Link href="/vendor/dashboard" style={{ marginRight: '0.5rem' }}>
                Dashboard
              </Link>
            )}
            {user.role === 'deliveryPartner' && (
              <Link href="/delivery/dashboard" style={{ marginRight: '0.5rem' }}>
                Dashboard
              </Link>
            )}
            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/vendor/login">Vendor Login</Link>
            <Link href="/vendor/signup">Vendor Signup</Link>
            <Link href="/delivery/login">Delivery Login</Link>
            <Link href="/delivery/signup">Delivery Signup</Link>
          </>
        )}
        <Link href="/track/dummy-order-id">Track Order (Demo)</Link>
      </div>
    </nav>
  );
};

export default Navbar;