import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: id,
        date: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    });

    return new Response(JSON.stringify({ attendance }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch attendance' }), { status: 500 });
  }
}
