import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const amount = typeof body.amount === 'number' ? body.amount : parseFloat(body.amount || '0');

    // Finance has unique studentId in schema. Update or create record
    const existing = await prisma.finance.findUnique({ where: { studentId: id } });

    if (existing) {
      const newDue = Math.max(0, existing.amountDue - amount);
      const updated = await prisma.finance.update({ where: { studentId: id }, data: { amountDue: newDue, paymentStatus: newDue === 0 ? 'Paid' : 'Pending' } });
      return new Response(JSON.stringify(updated), { status: 200 });
    } else {
      // Create a simple finance record; in a real app you would validate department/fee
      const created = await prisma.finance.create({ data: { id: `F-${Date.now()}`, studentId: id, department: 'Unknown', totalFee: amount, scholarshipAmount: 0, amountDue: 0, paymentStatus: 'Paid' } });
      return new Response(JSON.stringify(created), { status: 201 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to process payment' }), { status: 500 });
  }
}
