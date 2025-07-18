"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getAllClients,
  addClient as addClientAction,
  editClient as editClientAction,
  deleteClient as deleteClientAction,
  updateClientSecondaryEmails as updateClientSecondaryEmailsAction,
} from "@/lib/actions";

type Client = { id: number; name: string; primaryEmail: string; secondaryEmails: string[] };
type SetEmails = React.Dispatch<React.SetStateAction<string[]>>;

export default function ClientPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Add client form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientPrimaryEmail, setNewClientPrimaryEmail] = useState("");
  const [newClientSecondaryEmails, setNewClientSecondaryEmails] = useState<string[]>([""]);

  // Edit client form state
  const [editName, setEditName] = useState("");
  const [editPrimaryEmail, setEditPrimaryEmail] = useState("");
  const [editSecondaryEmails, setEditSecondaryEmails] = useState<string[]>([""]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Get actual current user info for audit logging
  const currentUser = {
    email: session?.user?.email ?? "",
    userName: (session as any)?.userName ?? session?.user?.name ?? "",
  };

  // Block mutation until login fully loaded
  const isReady = status === "authenticated" && currentUser.email;

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
    client.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.secondaryEmails || []).some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Start editing a client
  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditPrimaryEmail(client.primaryEmail);
    setEditSecondaryEmails(client.secondaryEmails.length ? [...client.secondaryEmails] : [""]);
  }

  // Save edited client to DB
  async function saveEdit(id: number) {
    if (!editName.trim() || !editPrimaryEmail.trim()) {
      alert("Name and primary email are required.");
      return;
    }
    if (!isReady) return;
    await editClientAction(
      id,
      editName.trim(),
      editPrimaryEmail.trim(),
      editSecondaryEmails.filter(e => e.trim() !== ""),
      currentUser
    );
    setClients(clients.map(c =>
      c.id === id
        ? {
            ...c,
            name: editName.trim(),
            primaryEmail: editPrimaryEmail.trim(),
            secondaryEmails: editSecondaryEmails.filter(e => e.trim() !== ""),
          }
        : c
    ));
    setEditingId(null);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
  }

  // Add new client to DB
  async function addClient() {
    if (!newClientName.trim() || !newClientPrimaryEmail.trim()) {
      alert("Please enter both name and primary email for the new client.");
      return;
    }
    if (!isReady) return;
    const newClient = await addClientAction(
      newClientName.trim(),
      newClientPrimaryEmail.trim(),
      newClientSecondaryEmails.filter(e => e.trim() !== ""),
      currentUser
    );
    setClients([...clients, newClient]);
    setNewClientName("");
    setNewClientPrimaryEmail("");
    setNewClientSecondaryEmails([""]);
  }

  // Delete a client from DB
  async function deleteClient(id: number) {
    if (!isReady) return;
    await deleteClientAction(id, currentUser);
    setClients(clients.filter(c => c.id !== id));
    if (editingId === id) setEditingId(null);
  }

  // Handlers for dynamic secondary email fields
  function handleSecondaryEmailChange(
    setter: SetEmails,
    idx: number,
    value: string,
    emails: string[]
  ) {
    const updated = [...emails];
    updated[idx] = value;
    setter(updated);
  }

  function addSecondaryEmailField(setter: SetEmails, emails: string[]) {
    setter([...emails, ""]);
  }

  function removeSecondaryEmailField(setter: SetEmails, idx: number, emails: string[]) {
    if (emails.length === 1) return; // Always keep at least one field
    setter(emails.filter((_, i) => i !== idx));
  }

  // Rendering
  if (status === "loading") return <div>Loading session...</div>;
  if (!isReady)
    return <div className="text-red-600">Not authenticated or identified.</div>;

  return (
    <div className="font-work-sans max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">CLIENTS</h1>

      {/* Add new client form */}
      <div className="mb-8 p-4 border rounded shadow-sm text-white bg-black">
        <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Client Name"
            value={newClientName}
            onChange={e => setNewClientName(e.target.value)}
            className="border rounded px-3 py-2 bg-white text-black"
          />
          <input
            type="email"
            placeholder="Primary Email"
            value={newClientPrimaryEmail}
            onChange={e => setNewClientPrimaryEmail(e.target.value)}
            className="border rounded px-3 py-2 bg-white text-black"
          />
          {/* Secondary Emails */}
          <div>
            <label className="block text-white font-semibold mb-1">Secondary Emails</label>
            {newClientSecondaryEmails.map((email, idx) => (
              <div className="flex items-center mb-2" key={idx}>
                <input
                  type="email"
                  placeholder={`Secondary Email #${idx + 1}`}
                  value={email}
                  onChange={e =>
                    handleSecondaryEmailChange(setNewClientSecondaryEmails, idx, e.target.value, newClientSecondaryEmails)
                  }
                  className="border rounded px-3 py-2 bg-white text-black flex-1"
                />
                <button
                  type="button"
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => removeSecondaryEmailField(setNewClientSecondaryEmails, idx, newClientSecondaryEmails)}
                  disabled={newClientSecondaryEmails.length === 1}
                  title="Remove"
                >−</button>
                {idx === newClientSecondaryEmails.length - 1 && (
                  <button
                    type="button"
                    className="ml-2 px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => addSecondaryEmailField(setNewClientSecondaryEmails, newClientSecondaryEmails)}
                    title="Add another secondary email"
                  >＋</button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addClient}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={!isReady}
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

      {/* Client List (for brevity, just desktop; include your mobile version as needed!) */}
      <div className="bg-white border rounded shadow-sm">
        <table className="w-full table-auto hidden sm:table">
          <thead className="bg-black text-white">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Primary Email</th>
              <th className="text-left px-4 py-2">Secondary Emails</th>
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
                      value={editPrimaryEmail}
                      onChange={e => setEditPrimaryEmail(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    client.primaryEmail
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === client.id ? (
                    <div>
                      {editSecondaryEmails.map((email, idx) => (
                        <div className="flex items-center mb-1" key={idx}>
                          <input
                            type="email"
                            placeholder={`Secondary Email #${idx + 1}`}
                            value={email}
                            onChange={e =>
                              handleSecondaryEmailChange(setEditSecondaryEmails, idx, e.target.value, editSecondaryEmails)
                            }
                            className="border rounded px-2 py-1 flex-1"
                          />
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => removeSecondaryEmailField(setEditSecondaryEmails, idx, editSecondaryEmails)}
                            disabled={editSecondaryEmails.length === 1}
                            title="Remove"
                          >−</button>
                          {idx === editSecondaryEmails.length - 1 && (
                            <button
                              type="button"
                              className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
                              onClick={() => addSecondaryEmailField(setEditSecondaryEmails, editSecondaryEmails)}
                              title="Add another secondary email"
                            >＋</button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul>
                      {client.secondaryEmails && client.secondaryEmails.length > 0
                        ? client.secondaryEmails.map((email, i) => (
                            <li key={i} className="text-xs">{email}</li>
                          ))
                        : <li className="text-xs text-gray-400">—</li>
                      }
                    </ul>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {editingId === client.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(client.id)}
                        className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        disabled={!isReady}
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
                        disabled={!isReady}
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
        {/* You can include the mobile card version here as in your original if needed */}
      </div>
    </div>
  );
}
