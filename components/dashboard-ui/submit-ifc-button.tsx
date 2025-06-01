'use client'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

const SubmitIFCButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending} className='self-start font-bold bg-blue-600 hover:bg-blue-700 cursor-pointer'>{pending ? 'Setting...' : 'Set User Profile'}</Button>
  )
}

export default SubmitIFCButton