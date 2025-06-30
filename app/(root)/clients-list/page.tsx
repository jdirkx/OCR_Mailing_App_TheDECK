"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import {
  getAllClients,
  addClient as dbAddClient,
  editClient as dbEditClient,
  deleteClient as dbDeleteClient,
} from "@/lib/actions";

export default function ClientPage() {
  const [clients, setClients] = useState<{ id: number; name: string; email: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch clients from DB on mount
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
      setLoading(false);
    }
    fetchClients();
  }, []);

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start editing a client
  function startEdit(client: { id: number; name: string; email: string }) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditEmail(client.email);
  }

  // Save edited client to DB
  async function saveEdit(id: number) {
    if (!editName.trim() || !editEmail.trim()) {
      alert("Name and email are required.");
      return;
    }
    await dbEditClient(id, editName.trim(), editEmail.trim());
    setClients(clients.map(c => c.id === id ? { ...c, name: editName.trim(), email: editEmail.trim() } : c));
    setEditingId(null);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
  }

  // Add new client to DB
  async function addClient() {
    if (!newClientName.trim() || !newClientEmail.trim()) {
      alert("Please enter both name and email for the new client.");
      return;
    }
    const newClient = await dbAddClient(newClientName.trim(), newClientEmail.trim());
    setClients([...clients, newClient]);
    setNewClientName("");
    setNewClientEmail("");
  }

  // Delete a client from DB
  async function deleteClient(id: number) {
    await dbDeleteClient(id);
    setClients(clients.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  return (
    <SessionProvider>
      <ProtectedRoute>
        <div className="font-work-sans max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 text-black">CLIENTS</h1>

          {/* Add new client form */}
          <div className="mb-8 p-4 border rounded shadow-sm bg-black">
            <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Client Name"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="border rounded px-3 py-2 flex-1 bg-white text-black"
              />
              <input
                type="email"
                placeholder="Client Email"
                value={newClientEmail}
                onChange={e => setNewClientEmail(e.target.value)}
                className="border rounded px-3 py-2 flex-1 bg-white text-black"
              />
              <button
                onClick={addClient}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Add Client
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white text-black"
            />
          </div>

          {/* Loading indicator */}
          {loading && <div className="text-center py-4">Loading...</div>}

          {/* Responsive Client List */}
          <div className="bg-white border rounded shadow-sm">
            {/* Desktop Table */}
            <table className="w-full table-auto hidden sm:table">
              <thead className="bg-black">
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client.id} className="border-t text-black">
                    <td className="px-4 py-2">
                      {editingId === client.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        client.name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingId === client.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        client.email
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {editingId === client.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(client.id)}
                            className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="mr-2 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(client)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile Cards */}
            <div className="sm:hidden flex flex-col gap-4 p-2">
              {filteredClients.map(client => (
                <div key={client.id} className="border rounded p-4 shadow-sm bg-black">
                  <div className="mb-2">
                    <span className="font-semibold">Name: </span>
                    {editingId === client.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      client.name
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Email: </span>
                    {editingId === client.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      client.email
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {editingId === client.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(client.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(client)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </SessionProvider>
  );
}
