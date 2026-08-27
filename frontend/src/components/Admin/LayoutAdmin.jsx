import React from 'react'
import { Outlet } from 'react-router-dom'
import NavbarAdmin from './NavbarAdmin'

const LayoutAdmin = () => {
  return (
    <div className='min-h-screen bg-gbg-3'>
        <NavbarAdmin />
        <Outlet />
    </div>
  )
}

export default LayoutAdmin