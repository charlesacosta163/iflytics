import { LoginForm } from '@/components/login-form'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <LoginForm />

        <Link href="/" className='text-sm font-medium text-gray-500 hover:text-gray-700 text-center flex items-center gap-2 justify-center'>Go To Guest Mode <FaArrowRight /></Link>
        
      </div>
    </div>
  )
}
