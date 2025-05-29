import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function DeliveryPartnerSignupPage() {
  return (
    <>
      <AuthForm mode="signup" userType="deliveryPartner" />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/delivery/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login as Delivery Partner
        </Link>
      </p>
    </>
  );
}