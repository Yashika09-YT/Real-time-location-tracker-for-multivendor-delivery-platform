import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function DeliveryPartnerLoginPage() {
  return (
    <>
      <AuthForm mode="login" userType="deliveryPartner" />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/delivery/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up as Delivery Partner
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-600">
        <Link href="/vendor/login" className="font-medium text-blue-600 hover:text-blue-500">
          Login as Vendor
        </Link>
      </p>
    </>
  );
}