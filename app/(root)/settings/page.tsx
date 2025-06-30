import ProtectedRoute from '@/components/ProtectedRoute'
import { SessionProvider } from 'next-auth/react'
import Setting from '@/components/Setting'
import React from 'react'

const Settings = () => {
  return (
    <SessionProvider>
        <ProtectedRoute>
            <div className='text-black'>
                <Setting />
            </div>
        </ProtectedRoute>
    </SessionProvider>
  )
}

export default Settings