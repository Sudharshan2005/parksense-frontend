"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const APP_LINK = process.env.NEXT_PUBLIC_APP_LINK;

type QRResponse = {
  qrText: string;
  qrImageUrl: string;
};

const LatestQR: React.FC = () => {
  const [qrData, setQrData] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchQr = () => {
      axios
        .get<QRResponse>(`${APP_LINK}/api/qr/generate-latest-qr`)
        .then((res) => {
          setQrData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch QR code.');
          setLoading(false);
        });
    };
  
    // Fetch initially
    fetchQr();
  
    // Set interval to fetch every 10 seconds
    const intervalId = setInterval(fetchQr, 1000);
  
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);
  

  if (loading) return <p>Loading QR code...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-2">Latest Vehicle QR</h2>
      {qrData && (
        <>
          <img src={qrData.qrImageUrl} alt="QR Code" className="w-48 h-48 mb-4" />
          <p className="text-white text-sm">{qrData.qrText}</p>
        </>
      )}
    </div>
  );
};

export default LatestQR;
