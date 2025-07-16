"use server"
import { PrismaClient, Prisma } from '@prisma/client'; // updated

const prisma = new PrismaClient();

type AuditLogInput = {
  email: string | null | undefined;
  userName: string | null | undefined;
  userCode: string | null | undefined;
  action: string;
  meta?: Prisma.JsonValue; // <-- FIXED
};

/**
 * Writes an audit log entry to the database.
 * Example usage:
 *   await auditLog({
 *     email: session.user.email,
 *     userName: session.userName,
 *     userCode: session.userCode,
 *     action: "DELETE_RECORD",
 *     meta: { recordId: 42 },
 *   });
 */
export async function auditLog({
  email,
  userName,
  userCode,
  action,
  meta,
}: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        email: email ?? "",
        userName: userName ?? "",
        userCode: userCode ?? "",
        action,
        meta: meta as Prisma.InputJsonValue | undefined
      },
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
  }
}

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
  secondaryEmails: string[] = []
) {
  return await prisma.client.create({
    data: { name, primaryEmail, secondaryEmails },
  });
}

// Edit a client, including emails
export async function editClient(
  id: number,
  name: string,
  primaryEmail: string,
  secondaryEmails: string[] = []
) {
  return await prisma.client.update({
    where: { id },
    data: { name, primaryEmail, secondaryEmails },
  });
}

// Delete a client by ID
export async function deleteClient(id: number) {
  return await prisma.client.delete({ where: { id } });
}

// Mail Intake: Add mail for a client
export async function addMailForClient(
  clientId: number,
  mailData: {
    imageUrls: string[];
    status?: string;
    urgency?: number;
    notes?: string;
  }
) {
  return await prisma.mail.create({
    data: {
      clientId: clientId,
      imageUrls: mailData.imageUrls,
      status: mailData.status || 'pending',
      urgency: mailData.urgency || 1,
      notes: mailData.notes || '',
      receivedAt: new Date(),
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
export async function updateMailStatus(mailId: number, status: string) {
  return await prisma.mail.update({
    where: { id: mailId },
    data: { status },
  });
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
