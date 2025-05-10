import Image from "next/image";
import { TbSearch } from "react-icons/tb";
import { redirect } from "next/navigation";
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import { IoStatsChartSharp } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";


export default function Home() {
  return (
    <div className="h-full w-full flex justify-center items-center">

      <div className="container w-full flex flex-col sm:flex-row items-center gap-8 p-4">

        <div className="flex-1 flex flex-col gap-8">
          <header className="flex flex-col items-center sm:items-start gap-2 sm:gap-4">
            <Image src={infinilyticsLogo} alt="Infinilytics Logo sm:w-[150px] sm:h-[150px] w-[100px] h-[100px]" width={150} height={150} />
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent flex gap-2 items-center"> IFlytics</h1>
            <p className="text-gray-500 sm:text-lg font-semibold">Your home to your stats of Infinite Flight!</p>
          </header>

          <section className="hidden sm:flex flex-col gap-4">

            <div className="flex gap-4 items-center">
              <span className="p-2 rounded-full bg-gray-200">
                <IoStatsChartSharp/>
              </span>
              <span className="font-semibold text-gray-600">Track your Infinite Flight Stats by your username</span>
            </div>

            <div className="flex gap-4 items-center">
              <span className="p-2 rounded-full bg-gray-200">
                <LuHistory/>
              </span>
              <span className="font-semibold text-gray-600">View your flight history and details</span>
            </div>


          </section>
          
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center">

          <form action={async (formData: FormData) => {
            'use server'
            redirect(`/user/${formData.get("name") as string}`)
          }} className="px-4 py-8 sm:p-8 rounded-lg bg-gray max-w-[600px] w-full shadow-gray-400 shadow-md">
            <h2 className="text-light text-center text-2xl tracking-tight font-bold mb-4 text-balance">Find your Infinite Flight Stats</h2>
            <div className="flex flex-col gap-4">
              <div className="text-white relative">
                <input type="text" name="name" className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full" placeholder="Enter your IFC Username" required/>
                <TbSearch className="absolute left-[10px] top-[12px] font-bold text-lg"/>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold">View My Stats</button>
              <span className="text-gray-300 text-xs text-center font-medium">Don't have an account? Join the <a href="https://community.infiniteflight.com/" className="text-blue-400">Infinite Flight Community</a> today!</span>
            </div>
          </form>
          <p className="text-xs font-medium text-gray-400">© 2025 IFlytics | Not affiliated with Infinite Flight</p>
        </div>

      </div>
    </div>
  );
}
