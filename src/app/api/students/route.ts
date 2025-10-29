import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // request.url may be relative when called from server-side fetch; provide a base to ensure parsing
    const url = new URL(request.url, "http://localhost");
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || undefined;
    const take = 10;
    const skip = take * (page - 1);

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, count] = await prisma.$transaction([
      prisma.student.findMany({ where, include: { class: true }, take, skip }),
      prisma.student.count({ where }),
    ]);

    return new Response(JSON.stringify({ data, count }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch students' }), { status: 500 });
  }
}
