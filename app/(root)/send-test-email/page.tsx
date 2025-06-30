// app/send-test-email/page.tsx
'use client';

import React, { useState } from 'react';

export default function SendTestEmailPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'matthewnguyen1230@gmail.com', // change to your email
          subject: 'Test Email from Next.js',
          text: 'Hello! This is a test email sent via Resend.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('✅ Email sent! Check your inbox.');
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatus('❌ Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow font-work-sans">
      <h1 className="text-xl font-bold mb-4">Send Test Email</h1>
      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Sending...' : 'Send Test Email'}
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
