import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = auth();

  // Find a single class that contains this student. Using findFirst returns
  // one class or null instead of an array, which avoids indexing into an
  // empty array and causing a runtime error when the student isn't assigned
  // to any class yet.
  const classItem = await prisma.class.findFirst({
    where: {
      students: { some: { id: userId! } },
    },
  });

  console.log("student class:", classItem);
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule (4A)</h1>
          {classItem ? (
            <BigCalendarContainer type="classId" id={classItem.id} />
          ) : (
            <div className="text-sm text-gray-500">No class assigned yet.</div>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
