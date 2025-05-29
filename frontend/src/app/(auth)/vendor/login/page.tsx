import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function VendorLoginPage() {
  return (
    <>
      <AuthForm mode="login" userType="vendor" />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/vendor/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up as Vendor
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-600">
        <Link href="/delivery/login" className="font-medium text-green-600 hover:text-green-500">
          Login as Delivery Partner
        </Link>
      </p>
    </>
  );
}