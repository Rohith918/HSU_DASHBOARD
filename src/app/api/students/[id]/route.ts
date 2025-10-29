import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: { class: { include: { _count: { select: { lessons: true } } } }, grade: true, finance: true },
    });

    if (!student) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(student), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch student' }), { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await prisma.student.update({ where: { id }, data: body });
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to update student' }), { status: 500 });
  }
}
