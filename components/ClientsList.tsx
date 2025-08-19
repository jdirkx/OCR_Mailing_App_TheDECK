"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getAllClients,
  addClient as addClientAction,
  deleteClient as deleteClientAction,
} from "@/lib/actions";

type Client = {
  id: number;
  name: string;
  people: string[];
  primaryEmail: string;
  secondaryEmails: string[];
  createdAt?: Date;
};
// Generic type for a state setter function that manages an array of strings.
type SetStringArray = React.Dispatch<React.SetStateAction<string[]>>;

export default function ClientPage() {
  const { data: session, status } = useSession();

  const currentUser = {
    email: session?.user?.email ?? "",
    userName: session?.userName ?? session?.user?.name ?? "",
  };

  // Block mutation until login fully loaded
  const isReady = status === "authenticated" && currentUser.email;

  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Add client form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientPrimaryEmail, setNewClientPrimaryEmail] = useState("");
  const [newClientSecondaryEmails, setNewClientSecondaryEmails] = useState<string[]>([""]);
  // State for the new client's people array
  const [newClientPerson, setNewClientPerson] = useState<string[]>([""]);

  // Edit client form state
  const [editName, setEditName] = useState("");
  const [editPrimaryEmail, setEditPrimaryEmail] = useState("");
  const [editSecondaryEmails, setEditSecondaryEmails] = useState<string[]>([""]);
  // State for the client's people array while editing
  const [editClientPerson, setEditClientPerson] = useState<string[]>([""]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);


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
    (client.secondaryEmails || []).some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.people || []).some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) // Filter by people's names
  );

  // Function to show a temporary error message
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  // Start editing a client
  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditClientPerson(client.people?.length ? [...client.people] : [""]);
    setEditPrimaryEmail(client.primaryEmail);
    setEditSecondaryEmails(client.secondaryEmails?.length ? [...client.secondaryEmails] : [""]);
  }

  // Save edited client to in-memory state
  function saveEdit(id: number) {
    if (!editName.trim() || !editPrimaryEmail.trim()) {
      showErrorMessage("Name and primary email are required.");
      return;
    }
    if (!isReady) return ;
    
    const updatedClient = {
      ...clients.find(c => c.id === id)!,
      name: editName.trim(),
      people: editClientPerson.filter(p => p.trim() !== ""),
      primaryEmail: editPrimaryEmail.trim(),
      secondaryEmails: editSecondaryEmails.filter(e => e.trim() !== ""),
    };
    setClients(clients.map(c => (c.id === id ? updatedClient : c)));
    setEditingId(null);
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
  }

  // Add new client
  async function addClient() {
    if (!newClientName.trim() || !newClientPrimaryEmail.trim()) {
      alert("Please enter both name and primary email for the new client.");
      return;
    }
    if (!isReady) return;
    const newClient = await addClientAction(
      newClientName.trim(),
      newClientPerson.filter(e => e.trim() !== ""),
      newClientPrimaryEmail.trim(),
      newClientSecondaryEmails.filter(e => e.trim() !== ""),
      currentUser
    );
    setClients([...clients, newClient]);
    setNewClientName("");
    setNewClientPerson([""]);
    setNewClientPrimaryEmail("");
    setNewClientSecondaryEmails([""]);
  }

  // Delete a client 
  async function deleteClient(id: number) {
    if (!isReady) return;
    await deleteClientAction(id, currentUser);
    setClients(clients.filter(c => c.id !== id));
    if (editingId === id) setEditingId(null);
  }

  // Handlers for dynamic person field
  function handlePersonChange(
    setter: SetStringArray,
    idx: number,
    value: string,
    list: string[]
  ) {
    const updated = [...list];
    updated[idx] = value;
    setter(updated);
  }

  function addPerson(setter: SetStringArray, list: string[]) {
    setter([...list, ""]);
  }

  function removePerson(setter: SetStringArray, idx: number, list: string[]) {
    if (list.length === 1) return; // Always keep at least one field
    setter(list.filter((_, i) => i !== idx));
  }

  // Handlers for dynamic secondary email fields
  function handleSecondaryEmailChange(
    setter: SetStringArray,
    idx: number,
    value: string,
    list: string[]
  ) {
    const updated = [...list];
    updated[idx] = value;
    setter(updated);
  }

  function addSecondaryEmailField(setter: SetStringArray, list: string[]) {
    setter([...list, ""]);
  }

  function removeSecondaryEmailField(setter: SetStringArray, idx: number, list: string[]) {
    if (list.length === 1) return; // Always keep at least one field
    setter(list.filter((_, i) => i !== idx));
  }

  // Rendering
  // The authentication logic has been removed, so checking loading or auth status is no longer necessary.

  return (
    <div className="font-work-sans max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">CLIENTS</h1>

      {/* Custom Error Message Display */}
      {errorMessage && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center transition-opacity duration-300">
          {errorMessage}
        </div>
      )}

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
          {/* People */}
          <div>
            <label className="block text-white font-semibold mb-1">People</label>
            {newClientPerson.map((name, idx) => (
              <div className="flex items-center mb-2" key={idx}>
                <input
                  type="text"
                  placeholder={`Person's Name #${idx + 1}`}
                  value={name}
                  onChange={e =>
                    handlePersonChange(setNewClientPerson, idx, e.target.value, newClientPerson)
                  }
                  className="border rounded px-3 py-2 bg-white text-black flex-1"
                />
                <button
                  type="button"
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => removePerson(setNewClientPerson, idx, newClientPerson)}
                  // Corrected disabled condition to use newClientPerson.length
                  disabled={newClientPerson.length === 1}
                  title="Remove"
                >−</button>
                {/* Corrected conditional render to use newClientPerson.length */}
                {idx === newClientPerson.length - 1 && (
                  <button
                    type="button"
                    className="ml-2 px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => addPerson(setNewClientPerson, newClientPerson)}
                    title="Add another person"
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
          placeholder="Search clients by name, email, or person..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white text-black"
        />
      </div>

      {/* Loading indicator */}
      {loading && <div className="text-center py-4">Loading...</div>}

      {/* Client List (desktop and mobile) */}
      <div className="bg-white border rounded shadow-sm">
        {/* Desktop Table */}
        <table className="w-full table-auto hidden sm:table">
          <thead className="bg-black text-white">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Primary Email</th>
              <th className="text-left px-4 py-2">Secondary Emails</th>
              <th className="text-left px-4 py-2">People</th>
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
                {/* People column for desktop view */}
                <td className="px-4 py-2">
                  {editingId === client.id ? (
                    <div>
                      {editClientPerson.map((name, idx) => (
                        <div className="flex items-center mb-1" key={idx}>
                          <input
                            type="text"
                            placeholder={`Person's Name #${idx + 1}`}
                            value={name}
                            onChange={e =>
                              handlePersonChange(setEditClientPerson, idx, e.target.value, editClientPerson)
                            }
                            className="border rounded px-2 py-1 flex-1"
                          />
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => removePerson(setEditClientPerson, idx, editClientPerson)}
                            disabled={editClientPerson.length === 1}
                            title="Remove"
                          >−</button>
                          {idx === editClientPerson.length - 1 && (
                            <button
                              type="button"
                              className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
                              onClick={() => addPerson(setEditClientPerson, editClientPerson)}
                              title="Add another person"
                            >＋</button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul>
                      {client.people && client.people.length > 0
                        ? client.people.map((name, i) => (
                          <li key={i} className="text-xs">{name}</li>
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
        {/* Mobile Card List */}
        <div className="flex flex-col gap-4 p-2 sm:hidden">
          {filteredClients.length === 0 ? (
            <div className="text-center text-gray-400">No clients found.</div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="border rounded p-4 bg-white shadow text-black">
                {editingId === client.id ? (
                  <>
                    {/* Editable fields */}
                    <div className="mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Client Name"
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="email"
                        value={editPrimaryEmail}
                        onChange={e => setEditPrimaryEmail(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Primary Email"
                      />
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Secondary Emails:</span>
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
                    <div className="mb-2">
                      <span className="font-semibold">People:</span>
                      {editClientPerson.map((name, idx) => (
                        <div className="flex items-center mb-1" key={idx}>
                          <input
                            type="text"
                            placeholder={`Person's Name #${idx + 1}`}
                            value={name}
                            onChange={e =>
                              handlePersonChange(setEditClientPerson, idx, e.target.value, editClientPerson)
                            }
                            className="border rounded px-2 py-1 flex-1"
                          />
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => removePerson(setEditClientPerson, idx, editClientPerson)}
                            disabled={editClientPerson.length === 1}
                            title="Remove"
                          >−</button>
                          {idx === editClientPerson.length - 1 && (
                            <button
                              type="button"
                              className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
                              onClick={() => addPerson(setEditClientPerson, editClientPerson)}
                              title="Add another person"
                            >＋</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(client.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        disabled={!isReady}
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
                        disabled={!isReady}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2">
                      <span className="font-semibold">Name: </span>{client.name}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Primary Email: </span>{client.primaryEmail}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Secondary Emails: </span>
                      {client.secondaryEmails && client.secondaryEmails.length > 0 ? (
                        <ul>
                          {client.secondaryEmails.map((email, i) => (
                            <li key={i} className="text-xs">{email}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">People: </span>
                      {client.people && client.people.length > 0 ? (
                        <ul>
                          {client.people.map((name, i) => (
                            <li key={i} className="text-xs">{name}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => startEdit(client)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        disabled={!isReady}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}