import PaginationBtn from '@/components/pagination-atc-btn'
import UserATCSessionCard from '@/components/user-atc-session-card'
import { getUserATCSessions } from '@/lib/actions'
import { aggregateAtcSessionsWithBuckets } from '@/lib/atc-actions'
import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
  
    // Decode and format the username for display
    const decodedName = decodeURIComponent(name);
    const formattedName = decodedName.replace(/\+/g, ' ');
  
    return {
      title: `${formattedName} - ATC Sessions | IFlytics`,
      description: `Explore ${formattedName}'s Infinite Flight ATC history. View controller performance, session activity, and traffic analytics on IFlytics.`,
      keywords: `infinite flight, atc tracking, air traffic control, controller statistics, radar control, ground control, tower control, approach control, departure control, aviation analytics, expert server, flight simulator, ${formattedName}, iflytics user, atc sessions`,
      openGraph: {
        title: `${formattedName} - IFlytics ATC Profile`,
        description: `View ${formattedName}'s Infinite Flight ATC sessions with detailed performance metrics and controller history.`,
        type: 'profile',
        url: `/user/${name}/atc`,
      },
      twitter: {
        card: 'summary',
        title: `${formattedName} - IFlytics ATC Profile`,
        description: `Check out ${formattedName}'s Infinite Flight ATC history and performance on IFlytics.`,
      },
    }
  }

type PageProps = {
    params: Promise<{name: string | string[] | undefined}>,
    searchParams: Promise<{page?: string}>
}

const ATCHistoryPage = async ({ params, searchParams }: PageProps) => {
    const { name } = (await params) as { name: string }
    const { page } = await searchParams
  
    const sessions = await getUserATCSessions(name, page ? Number(page) : 1)
  
    // Guard 1: user not found or API error
    if (!sessions.success) {
      return (
        <div className="flex flex-col">
            <div className="p-4 flex flex-col gap-4">
                <h2 className='text-5xl font-black dark:text-light bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent py-0.5'>ATC</h2>
                <p className="text-gray-500">{"No ATC sessions available."}</p>
                <Link href={`/user/${name}/atc`} className="bg-gray hover:bg-dark text-light px-4 py-2 text-sm rounded-full font-bold self-start">Back</Link>
            </div>

        </div>
      )
    }
  
    // Guard 2: missing or empty data
    const apiResult = sessions.data?.result
    if (!apiResult || !Array.isArray(apiResult.data) || apiResult.data.length === 0) {
      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold">ATC</h2>
          <p className="text-gray-500">No ATC sessions found.</p>
        </div>
      )
    }
  
    const {
      data: atcSessions,
      pageIndex,
      totalPages,
      totalCount,
      hasPreviousPage,
      hasNextPage,
    } = apiResult
  
    const atcMetrics = aggregateAtcSessionsWithBuckets(atcSessions)
  
    return (
      <div className="p-4 flex flex-col gap-4">
         <div className="flex items-center justify-between gap-2">
                <h2 className='text-5xl font-black dark:text-light bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent py-0.5 flex gap-4 items-center'>ATC <Badge className="bg-orange-500 text-light text-lg font-bold" >BETA</Badge></h2>
                <div className="text-sm text-muted-foreground">
                    <span className="sm:block hidden">Showing page {pageIndex} of {totalPages} ({totalCount} total sessions)</span>
                    <span className="sm:hidden">Page {pageIndex} of {totalPages}</span>
                </div>
            </div>
  
        <div className="grid grid-cols-1 gap-4">
          {atcMetrics.map((e: any, i: number) => (
            <UserATCSessionCard key={i} session={e} />
          ))}
        </div>
  
        <div className="flex justify-center mt-4">
          <PaginationBtn
            name={name}
            pageIndex={pageIndex}
            totalPages={totalPages}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    )
  }
  
export default ATCHistoryPage