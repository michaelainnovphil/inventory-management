"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function RequestList() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("/api/request")
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  const handleAction = async (id, action) => {
    const res = await fetch(`/api/request/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      toast.success(`Request ${action}`);
      setRequests((prev) => prev.filter(r => r._id !== id));
    } else {
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td className="p-2 border">{req.productId.name}</td>
                <td className="p-2 border">{req.quantity}</td>
                <td className="p-2 border">{req.reason}</td>
                <td className="p-2 border">{req.requestedBy}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleAction(req._id, "approve")} className="text-green-600">Approve</button>
                  <button onClick={() => handleAction(req._id, "deny")} className="text-red-600">Deny</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
