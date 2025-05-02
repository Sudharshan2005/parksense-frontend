"use client"

import { useState } from 'react';

export default function Home() {
  const [urlInput, setUrlInput] = useState('http://172.168.0.109:3000/user/new');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      // Basic URL validation
      const url = new URL(urlInput); // throws if invalid
      const response = await fetch('http://localhost:5001/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.href }),
      });
      const data = await response.json();
      if (data.qr) {
        setQrCode(data.qr);
        setError('');
      } else {
        setError('QR generation failed');
      }
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">URL to QR Code Generator</h1>
        <input
          type="text"
          className="w-full p-4 border rounded-md text-sm"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter a valid URL (e.g., https://example.com)"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full"
          onClick={handleGenerate}
        >
          Generate QR
        </button>
        {qrCode && (
          <div className="mt-6 text-center">
            <img src={qrCode} alt="Generated QR Code" className="mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Scan to visit the URL</p>
          </div>
        )}
      </div>
    </div>
  );
}
