import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function VendorSignupPage() {
  return (
    <>
      <AuthForm mode="signup" userType="vendor" />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/vendor/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login as Vendor
        </Link>
      </p>
    </>
  );
}