'use client'
import { Button } from '@/components/ui/button'

import React, {use} from 'react'

const EditProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params)

  return (
    <div>

        <form>
            Under Construction
        </form>


    </div>
  )
}

export default EditProfilePage