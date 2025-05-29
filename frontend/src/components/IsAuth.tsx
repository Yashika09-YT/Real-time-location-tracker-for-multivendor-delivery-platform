"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

interface IsAuthProps {
    children: ReactNode;
    allowedRoles?: Array<User['role']>;
}

const IsAuth: React.FC<IsAuthProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/vendor/login');
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            if (user.role === 'vendor') router.push('/vendor/dashboard');
            else if (user.role === 'deliveryPartner') router.push('/delivery/dashboard');
            else router.push('/');
            return;
        }

    }, [isAuthenticated, isLoading, user, allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="page-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #4299e1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ fontSize: '1.1rem', color: '#4a5568' }}>Loading authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="page-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '1.1rem', color: '#4a5568' }}>Redirecting to login...</p>
            </div>
        );
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="page-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '1.1rem', color: '#e53e3e' }}>Unauthorized. Redirecting...</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default IsAuth;