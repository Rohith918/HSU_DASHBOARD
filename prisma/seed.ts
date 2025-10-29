import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const departments = ["Information Systems", "Computer Science", "Data Analyst"] as const;
const departmentPrefixes = { "Information Systems": "IS", "Computer Science": "CS", "Data Analyst": "DA" };
const departmentFees = { IS: 36000, DA: 42000, CS: 46000 };

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGPA(): number {
  return parseFloat((Math.random() * 4).toFixed(2));
}

function randomScholarship(deptPrefix: keyof typeof departmentFees): number {
  const maxScholarship = departmentFees[deptPrefix] * 0.25;
  return parseFloat((Math.random() * maxScholarship).toFixed(2));
}

async function main() {
  console.log("🌱 Seeding university data...");

  // ====== DEPARTMENTS ======
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept },
      update: {},
      create: { name: dept },
    });
  }

  // ====== COURSES ======
  for (const dept of departments) {
    const prefix = departmentPrefixes[dept as keyof typeof departmentPrefixes];
    for (let i = 1; i <= 12; i++) {
      const courseId = `${prefix}${String(i + 100).padStart(3, "0")}`;
      await prisma.course.upsert({
        where: { id: courseId },
        update: {},
        create: {
          id: courseId,
          name: `${prefix} Course ${i}`,
          credits: 3,
          departmentName: dept,
        },
      });
    }
  }

  // ====== PARENTS ======
  const parents = [];
  for (let i = 1; i <= 50; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name: `Parent${i}`,
        surname: `Surname${i}`,
        email: `parent${i}@hsu.edu`,
        phone: `12345678${100 + i}`,
        address: `Address ${i}`,
      },
    });
    parents.push(parent);
  }

  // ====== GRADES & CLASSES ======
  const grades = [];
  for (let g = 1; g <= 4; g++) {
    const grade = await prisma.grade.upsert({
      where: { level: g },
      update: {},
      create: { level: g },
    });
    grades.push(grade);
  }

  const classes = [];
  for (let i = 0; i < 8; i++) {
    const cls = await prisma.class.upsert({
      where: { name: `Class ${String.fromCharCode(65 + i)}` },
      update: {},
      create: {
        name: `Class ${String.fromCharCode(65 + i)}`,
        capacity: 30,
        gradeId: Math.floor(i / 2) + 1,
      },
    });
    classes.push(cls);
  }

  // ====== TEACHERS ======
  const teachers = [];
  for (let i = 1; i <= 20; i++) {
    const id = `TCH${String(i).padStart(4, "0")}`;
    const teacher = await prisma.teacher.upsert({
      where: { id },
      update: {},
      create: {
        id,
        username: `teacher${i}`,
        name: `Teacher`,
        surname: `${i}`,
        email: `teacher${i}@hsu.edu`,
        phone: `+1${String(randomInt(1000000000, 9999999999))}`,
        address: `${randomInt(100, 999)} Teacher Street`,
        bloodType: "O+",
        sex: "MALE",
        birthday: new Date(1980, 0, 1),
      },
    });
    teachers.push(teacher);
  }

  // ====== STUDENTS & FINANCE ======
  const students: any[] = [];
  for (let i = 1; i <= 80; i++) {
    const id = `STU${String(i).padStart(4, "0")}`;
    const classId = classes[randomInt(0, classes.length - 1)].id;
    const parentId = parents[randomInt(0, parents.length - 1)].id;
    const dept = departments[randomInt(0, departments.length - 1)];
    const prefix = departmentPrefixes[dept as keyof typeof departmentPrefixes] as keyof typeof departmentFees;
    const fee = departmentFees[prefix];
    const scholarship = randomScholarship(prefix);

    const student = await prisma.student.upsert({
      where: { id },
      update: {},
      create: {
        id,
        username: `student${i}`,
        name: `Student${i}`,
        surname: `Surname${i}`,
        email: `student${i}@hsu.edu`,
        phone: `+1${String(randomInt(1000000000, 9999999999))}`,
        address: `${randomInt(100, 999)} Student Drive`,
        bloodType: "O+",
        sex: "FEMALE",
        birthday: new Date(2004, 0, 1),
        parentId,
        classId,
        gradeId: Math.floor((classId - 1) / 2) + 1,
        department: dept,
        attendancePercentage: randomInt(60, 100),
        gpa: parseFloat((Math.random() * (4.0 - 2.0) + 2.0).toFixed(2)),
      },
    });
    students.push(student);

    // create or update finance
    const financeId = `F-${id}`;
    await prisma.finance.upsert({
      where: { studentId: id },
      update: { totalFee: fee, scholarshipAmount: scholarship, amountDue: fee - scholarship, paymentStatus: Math.random() > 0.5 ? "Paid" : "Pending" },
      create: { id: financeId, studentId: id, department: dept, totalFee: fee, scholarshipAmount: scholarship, amountDue: fee - scholarship, paymentStatus: Math.random() > 0.5 ? "Paid" : "Pending" },
    });
  }

    // ====== ADMIN ======
    await prisma.admin.upsert({ where: { id: "ADMIN001" }, update: {}, create: { id: "ADMIN001", username: "admin" } });

    // ====== SUBJECTS ======
    const subjectNames = ["Mathematics", "Physics", "Computer Science", "Database", "Web Development", "Software Engineering"];
    const subjects: any[] = [];
    for (const name of subjectNames) {
      const subj = await prisma.subject.upsert({ where: { name }, update: {}, create: { name } });
      subjects.push(subj);
    }

    // ====== ASSIGN SUBJECTS TO TEACHERS ======
    for (const teacher of teachers) {
      const picks: number[] = [];
      const count = randomInt(1, 3);
      for (let i = 0; i < count; i++) {
        const s = subjects[randomInt(0, subjects.length - 1)];
        if (!picks.includes(s.id)) picks.push(s.id);
      }
      await prisma.teacher.update({ where: { id: teacher.id }, data: { subjects: { connect: picks.map((id) => ({ id })) } } });
    }

    // ====== LESSONS ======
    const dayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const lessons: any[] = [];
    for (const cls of classes) {
      for (let i = 0; i < 5; i++) {
        // ensure one lesson per class per day
        const existing = await prisma.lesson.findFirst({ where: { classId: cls.id, day: dayNames[i] as any } });
        if (existing) {
          lessons.push(existing);
          continue;
        }
        const subject = subjects[randomInt(0, subjects.length - 1)];
        const teacher = teachers[randomInt(0, teachers.length - 1)];
        const startTime = new Date();
        startTime.setHours(8 + i * 2, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1, 30, 0, 0);
        const lesson = await prisma.lesson.create({ data: { name: `${cls.name} Lesson ${i + 1}`, day: dayNames[i] as any, startTime, endTime, subjectId: subject.id, classId: cls.id, teacherId: teacher.id } });
        lessons.push(lesson);
      }
    }

    // ====== EXAMS & ASSIGNMENTS ======
    const exams: any[] = [];
    const assignments: any[] = [];
    for (const lesson of lessons) {
      const exam = await prisma.exam.create({ data: { title: `${lesson.name} Exam`, startTime: new Date(), endTime: new Date(Date.now() + 60 * 60 * 1000), lessonId: lesson.id } });
      exams.push(exam);
      const assignment = await prisma.assignment.create({ data: { title: `${lesson.name} Assignment`, startDate: new Date(), dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), lessonId: lesson.id } });
      assignments.push(assignment);
    }

    // ====== ATTENDANCE & RESULTS ======
    for (const cls of classes) {
      const classStudents = students.filter((s) => s.classId === cls.id);
      const classLessons = lessons.filter((l) => l.classId === cls.id);
      for (const student of classStudents) {
        // create 5 attendance records for recent days
        for (let d = 0; d < 5; d++) {
          const lesson = classLessons[d % classLessons.length];
          const date = new Date();
          date.setDate(date.getDate() - d);
          await prisma.attendance.create({ data: { date, present: Math.random() > 0.2, studentId: student.id, lessonId: lesson.id } });
        }
      }

      // results for exams and assignments for class students
      const classExams = exams.filter((e) => classLessons.some((l) => l.id === e.lessonId));
      const classAssignments = assignments.filter((a) => classLessons.some((l) => l.id === a.lessonId));
      for (const exam of classExams) {
        for (const student of classStudents) {
          await prisma.result.create({ data: { score: randomInt(40, 100), examId: exam.id, studentId: student.id } });
        }
      }
      for (const assignment of classAssignments) {
        for (const student of classStudents) {
          await prisma.result.create({ data: { score: randomInt(40, 100), assignmentId: assignment.id, studentId: student.id } });
        }
      }
    }

    // ====== EVENTS & ANNOUNCEMENTS ======
    for (const cls of classes) {
      await prisma.event.create({ data: { title: `${cls.name} Orientation`, description: `Orientation for ${cls.name}`, startTime: new Date(), endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), classId: cls.id } });
      await prisma.announcement.create({ data: { title: `${cls.name} Notice`, description: `Notice for ${cls.name}`, date: new Date(), classId: cls.id } });
    }

    console.log("✅ Seeding complete.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
