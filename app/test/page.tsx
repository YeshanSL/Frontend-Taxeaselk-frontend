"use client";
import { useEffect, useState } from "react";

export default function ConnectionTest() {
  const [serverData, setServerData] = useState("Pinging backend...");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/`) 
      .then((response) => response.json())
      .then((data) => {
        setServerData(`✅ Connected! Service: ${data.service}, Status: ${data.status}`);
      })
      .catch((error) => {
        console.error(error);
        setServerData("❌ Failed to connect. Is the FastAPI server running?");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-bold mb-4">TaxEaseLK Bridge Test</h1>
        <p className="text-lg font-mono text-gray-700">{serverData}</p>
      </div>
    </div>
  );
}