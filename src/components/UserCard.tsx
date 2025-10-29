import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  try {
    const res = await fetch(`${base}/api/stats?type=${type}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch stats");
    const json = await res.json();
    const data = json.count ?? 0;

    return (
      <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
            2024/25
          </span>
          <Image src="/more.png" alt="" width={20} height={20} />
        </div>
        <h1 className="text-2xl font-semibold my-4">{data}</h1>
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
      </div>
    );
  } catch (err) {
    console.warn("Failed to load user count for", type, err);
    return (
      <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
        <div className="flex justify-between items-center">
          <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
            2024/25
          </span>
          <Image src="/more.png" alt="" width={20} height={20} />
        </div>
        <h1 className="text-2xl font-semibold my-4">-</h1>
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
      </div>
    );
  }
};

export default UserCard;
