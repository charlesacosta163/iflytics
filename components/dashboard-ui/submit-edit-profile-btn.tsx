'use client'

import { Button } from "../ui/button"
import { useFormStatus } from "react-dom"

const SubmitEditProfileBtn = () => {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending} className='self-start rounded-lg'>
            {pending ? 'Saving...' : 'Save'}
        </Button>
    )
}

export default SubmitEditProfileBtn