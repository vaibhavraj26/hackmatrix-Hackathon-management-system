import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-indigo-500 mx-auto animate-bounce" />
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400 text-sm">
            The page you are looking for does not exist or has been relocated.
          </p>
        </div>
        <Link to="/" className="inline-block w-full">
          <Button className="w-full">Return Home</Button>
        </Link>
      </Card>
    </div>
  );
}
