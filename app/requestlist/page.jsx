// components/RequestListModal.jsx
"use client";
import { useEffect, useState } from "react";

export default function RequestListModal({ onClose }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/request", {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("❌ GET /api/request error:", error.message);
      alert("Failed to fetch requests: " + error.message);
    }
  };

  const handleAction = async (requestId, status) => {
    const res = await fetch("/api/request", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ requestId, status }),
    });
    const data = await res.json();
    if (data.success) fetchRequests();
    else alert("Action failed: " + data.message);
  };

  const handleDelete = async (requestId) => {
    setDeleteId(requestId);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter((req) => {
    if (filter === "pending") return req.status === "pending";
    if (filter === "decided") return req.status === "approved" || req.status === "declined";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-start pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Item Requests</h2>

        <div className="flex gap-4 mb-6">
          {["all", "pending", "decided"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1 rounded-full border font-medium text-sm ${
                filter === type
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {type === "all" && "All"}
              {type === "pending" && "Pending"}
              {type === "decided" && "Approved/Declined"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-500">No requests to show.</p>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex justify-between items-start"
              >
                {/* Left side: Request info */}
                <div className="space-y-1">
                  <p>
                    <strong>Item:</strong> {req.productId?.slug || "N/A"}
                  </p>
                  <p>
                    <strong>Requested by:</strong> {req.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {req.quantity}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : req.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.status?.toUpperCase()}
                    </span>
                  </p>
                </div>

                {/* Right side: Actions */}
                <div className="flex flex-col items-end gap-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(req._id, "approved")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "declined")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(req._id)}
                    className="text-sm text-red-500 hover:underline mt-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this request?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/request", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem("token"),
                      },
                      body: JSON.stringify({ requestId: deleteId }),
                    });
                    const data = await res.json();
                    if (data.success) fetchRequests();
                    else alert("Delete failed: " + data.message);
                  } catch (error) {
                    alert("Failed to delete request: " + error.message);
                  } finally {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }
                }}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
