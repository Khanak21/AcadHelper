"use client"
import Timer from '@/components/Timer'
import Layout from '@/components/layout'
import Auth from '@/components/Auth'
import React from 'react'

const Focus = () => {
  return (
    <div>
        <Layout>
          <Timer/>
        </Layout>
    </div>
  )
}
export default Auth(Focus)