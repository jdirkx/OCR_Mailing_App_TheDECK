import React from 'react';
import { signOutAction } from '@/lib/auth-actions';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow font-work-sans">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Add more settings here as needed */}

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition duration-150"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
