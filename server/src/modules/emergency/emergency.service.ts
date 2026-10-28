import prisma from '../../config/db';

export class EmergencyService {
  static async getContacts(userId: string) {
    const userContacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const publicHelplines = [
      {
        id: 'pub-1',
        name: 'National Emergency Helpline (Police / Fire / Ambulance)',
        contactType: 'PUBLIC_EMERGENCY',
        phone: '112',
        altPhone: '100',
        policyOrAccountNo: 'National Unified Helpline',
        notes: '24/7 toll-free emergency response across India',
      },
      {
        id: 'pub-2',
        name: 'National Highway Authority Helpline (NHAI)',
        contactType: 'HIGHWAY_ASSISTANCE',
        phone: '1033',
        altPhone: null,
        policyOrAccountNo: 'Govt. Highway Toll & Towing',
        notes: 'Dedicated 24x7 highway breakdown, ambulance, and towing support',
      },
      {
        id: 'pub-3',
        name: 'Traffic Police Helpline & Accident Support',
        contactType: 'TRAFFIC_CONTROL',
        phone: '103',
        altPhone: null,
        policyOrAccountNo: 'City Traffic Command',
        notes: 'Emergency traffic management and route obstruction support',
      },
    ];

    return {
      userContacts,
      publicHelplines,
    };
  }

  static async createContact(userId: string, data: any) {
    return prisma.emergencyContact.create({
      data: {
        userId,
        name: data.name.trim(),
        contactType: data.contactType,
        phone: data.phone.trim(),
        altPhone: data.altPhone?.trim() || null,
        policyOrAccountNo: data.policyOrAccountNo?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  static async updateContact(userId: string, id: string, data: any) {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id, userId },
    });
    if (!contact) throw new Error('Contact not found or unauthorized');

    return prisma.emergencyContact.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.contactType ? { contactType: data.contactType } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.altPhone !== undefined ? { altPhone: data.altPhone?.trim() || null } : {}),
        ...(data.policyOrAccountNo !== undefined
          ? { policyOrAccountNo: data.policyOrAccountNo?.trim() || null }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      },
    });
  }

  static async deleteContact(userId: string, id: string) {
    const contact = await prisma.emergencyContact.findFirst({
      where: { id, userId },
    });
    if (!contact) throw new Error('Contact not found or unauthorized');

    await prisma.emergencyContact.delete({ where: { id } });
    return { success: true, message: 'Emergency contact removed.' };
  }
}

