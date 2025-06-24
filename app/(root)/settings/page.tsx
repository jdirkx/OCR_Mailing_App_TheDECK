import ProtectedRoute from '@/app/components/ProtectedRoute'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const Settings = () => {
  return (
    <SessionProvider>
        <ProtectedRoute>
            <div className='text-black'>
                Settings
            </div>
        </ProtectedRoute>
    </SessionProvider>
  )
}

export default Settings