const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/students/${id}/attendance`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div>
        <h1 className="text-xl font-semibold">-</h1>
        <span className="text-sm text-gray-400">Attendance</span>
      </div>
    );
  }
  const json = await res.json();
  const attendance = json.attendance || [];

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day: any) => day.present).length;
  const percentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;
  return (
    <div className="">
      <h1 className="text-xl font-semibold">{percentage || "-"}%</h1>
      <span className="text-sm text-gray-400">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
