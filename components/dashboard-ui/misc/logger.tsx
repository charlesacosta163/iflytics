"use client";

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const Logger = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("test") === "success") {
      console.log("Test success")
    }
  }, [searchParams])

  return null
}

export default Logger