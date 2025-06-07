import ProfileHeader from "@/components/profile-header";
import { getUserStats } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function RootLayout({
    children,
    params
  }: Readonly<{
    children: React.ReactNode;
    params: Promise<{name: string}>
  }>) {

    const { name } = await params;

    // User Statistics
  let data: any = null;
  let result: any = null;

  try {
    if (!name) {
      return notFound();
    }

    data = await getUserStats(name);

    if (
      !data ||
      !data.result ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      return notFound();
    }

    result = data.result[0];

    if (!result || typeof result !== "object") {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return notFound();
  }

    return (
        <div className="min-h-screen flex flex-col max-w-[1000px] w-full mx-auto">
            {/* <ProfileHeader
        name={result.discourseUsername}
        grade={result.grade}
        organization={result.virtualOrganization}
      /> */}
            <ProfileHeader id={result.userId} name={result.discourseUsername} grade={result.grade} organization={result.virtualOrganization} />
            
            <main className="flex-1 flex flex-col max-w-[1000px] w-full">        
                  {children}
            </main>
        </div>
    );
  }