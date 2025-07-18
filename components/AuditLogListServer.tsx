import { getAuditLogs } from "@/lib/actions";

export default async function AuditLogListServer() {
  const logs = await getAuditLogs(100);

  return (
    <table className="min-w-full bg-white border text-sm text-left">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-2 border">Time</th>
          <th className="py-2 px-2 border">User</th>
          <th className="py-2 px-2 border">Email</th>
          <th className="py-2 px-2 border">Action</th>
          <th className="py-2 px-2 border">Meta</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log: any) => (
          <tr key={log.id} className="border-b hover:bg-gray-50">
            <td className="py-1 px-2 border">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</td>
            <td className="py-1 px-2 border">{log.userName}</td>
            <td className="py-1 px-2 border">{log.email}</td>
            <td className="py-1 px-2 border text-blue-700 font-mono">{log.action}</td>
            <td className="py-1 px-2 border max-w-xs overflow-x-auto whitespace-pre-wrap">
              <pre className="text-xs font-mono bg-gray-50 rounded p-2">{log.meta ? JSON.stringify(log.meta, null, 2) : ""}</pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
