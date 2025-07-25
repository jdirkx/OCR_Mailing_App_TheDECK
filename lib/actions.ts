"use server"
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type AuditLogInput = {
  email: string | null | undefined;
  userName: string | null | undefined;
  action: string;
  meta?: Prisma.JsonValue;
};

/**
 * Writes an audit log entry to the database.
 * Example usage:
 *   await auditLog({
 *     email: session.user.email,
 *     userName: session.userName,
 *     action: "DELETE_RECORD",
 *     meta: { recordId: 42 },
 *   });
 */
export async function auditLog({
  email,
  userName,
  action,
  meta,
}: AuditLogInput) {
  console.log("auditLog called with", { email, userName, action, meta });
  try {
    await prisma.auditLog.create({
      data: {
        email: email ?? "",
        userName: userName ?? "",
        action,
        meta: meta as Prisma.InputJsonValue | undefined
      },
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
  }
}

// Fetch all audit logs from database
export async function getAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function auditSendEmail({
  email,
  userName,
  clientId,
  imageCount,
  notes,
}: {
  email: string;
  userName: string;
  clientId: number;
  imageCount: number;
  notes?: string;
}) {
  await auditLog({
    email,
    userName,
    action: "SEND_EMAIL",
    meta: {
      clientId,
      imageCount,
      notes,
      timestamp: new Date().toISOString(),
    },
  });
}

//Mail info per client - only used in backend
export type MailPayload = {
  clientId: number | String;
  images: { preview: string }[]; 
  files: File[];
  notes?: string;
};

// Get client information by ID (includes secondary emails)
export async function getClientById(clientId: number) {
  return await prisma.client.findUnique({
    where: { id: clientId },
    include: { mails: true },
  });
}

// Get all clients (includes secondary emails)
export async function getAllClients() {
  return await prisma.client.findMany({ orderBy: { id: "asc" } });
}

// Add a client with primary and secondary emails
export async function addClient(
  name: string,
  primaryEmail: string,
  secondaryEmails: string[] = [],
  auditUser?: { email: string | null | undefined; userName: string | null | undefined }
) {
  const client = await prisma.client.create({
    data: { name, primaryEmail, secondaryEmails },
  });

  // Audit log for adding client
  if (auditUser) {
    await auditLog({
      email: auditUser.email,
      userName: auditUser.userName,
      action: "ADD_CLIENT",
      meta: { clientId: client.id, name, primaryEmail, secondaryEmails }
    });
  }

  return client;
}

// Edit a client, including emails
export async function editClient(
  id: number,
  name: string,
  primaryEmail: string,
  secondaryEmails: string[] = [],
  auditUser?: { email: string | null | undefined; userName: string | null | undefined }
) {
  const client = await prisma.client.update({
    where: { id },
    data: { name, primaryEmail, secondaryEmails },
  });

  // Audit log for editing client
  if (auditUser) {
    await auditLog({
      email: auditUser.email,
      userName: auditUser.userName,
      action: "EDIT_CLIENT",
      meta: { clientId: id, newName: name, newPrimaryEmail: primaryEmail, newSecondaryEmails: secondaryEmails }
    });
  }

  return client;
}


// Delete a client by ID
export async function deleteClient(
  id: number,
  auditUser?: { email: string | null | undefined; userName: string | null | undefined }
) {
  const client = await prisma.client.delete({ where: { id } });

  // Audit log for deleting client
  if (auditUser) {
    await auditLog({
      email: auditUser.email,
      userName: auditUser.userName,
      action: "DELETE_CLIENT",
      meta: { clientId: id, deletedName: client.name, deletedPrimaryEmail: client.primaryEmail }
    });
  }

  return client;
}

// Mail Intake: Add mail for a client
export async function addMailForClient(payload: MailPayload) {
  if (typeof payload.clientId !== "number") {
    throw new Error("clientId must be a number");
  }
  return await prisma.mail.create({
    data: {
      clientId: payload.clientId,
      imageUrls: payload.images.map(img => img.preview),
      notes: payload.notes ?? ''
    },
  });
}

// Get all mails for a client
export async function getMailsByClientId(clientId: number) {
  return await prisma.mail.findMany({
    where: { clientId: clientId },
    orderBy: { receivedAt: 'desc' },
  });
}

// Update mail status
export async function updateMailStatus(
  mailId: number,
  status: string,
  auditUser?: { email: string | null | undefined; userName: string | null | undefined }
) {
  const mail = await prisma.mail.update({
    where: { id: mailId },
    data: { status },
  });

  if (auditUser) {
    await auditLog({
      email: auditUser.email,
      userName: auditUser.userName,
      action: "UPDATE_MAIL_STATUS",
      meta: { mailId, newStatus: status }
    });
  }

  return mail;
}

// Delete a mail by ID
export async function deleteMail(mailId: number) {
  return await prisma.mail.delete({
    where: { id: mailId },
  });
}

// Close Prisma Client connection (optional for scripts)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
