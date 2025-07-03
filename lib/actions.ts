// lib/action.ts
"use server"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get client (client) information by ID
export async function getClientById(clientId: number) {
  return await prisma.client.findUnique({
    where: { id: clientId },
    include: { mails: true },
  });
}

// Client List:
// Get all companies

export async function getAllClients() {
  return await prisma.client.findMany({ orderBy: { id: "asc" } });
}

export async function addClient(name: string, email: string) {
  return await prisma.client.create({ data: { name, email } });
}

export async function editClient(id: number, name: string, email: string) {
  return await prisma.client.update({
    where: { id },
    data: { name, email },
  });
}

export async function deleteClient(id: number) {
  return await prisma.client.delete({ where: { id } });
}


// Mail Intake:
// Add mail corresponding to a client
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
