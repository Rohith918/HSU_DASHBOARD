import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // request.url may be relative when called from server-side fetch; provide a base to ensure parsing
    const url = new URL(request.url, "http://localhost");
    const type = url.searchParams.get('type');

    const safeCount = async (model: string) => {
      try {
        switch (model) {
          case 'admin':
            return await prisma.admin.count();
          case 'teacher':
            return await prisma.teacher.count();
          case 'student':
            return await prisma.student.count();
          case 'parent':
            return await prisma.parent.count();
          default:
            return 0;
        }
      } catch (err: any) {
        // If the underlying table doesn't exist or any other DB error, return 0
        console.warn(`Count failed for ${model}:`, err?.message || err);
        return 0;
      }
    };

    if (type) {
      const count = await safeCount(type);
      return new Response(JSON.stringify({ type, count }), { status: 200 });
    }

    const [admin, teacher, student, parent] = await Promise.all([
      safeCount('admin'),
      safeCount('teacher'),
      safeCount('student'),
      safeCount('parent'),
    ]);

    return new Response(JSON.stringify({ admin, teacher, student, parent }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 });
  }
}
