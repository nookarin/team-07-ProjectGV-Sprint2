import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='bg-[#050508] text-[#8A8A93]'>
      <div>
        <h2 className='text-white'><span className='font-black text-[#BF00FF]'>|</span> SHOP</h2>
        <ul className='uppercase flex flex-col gap-4'>
          <li><Link>All Products</Link></li>
          <li><Link>Keyboard</Link></li>
          <li><Link>Headset</Link></li>
          <li><Link>Mouse</Link></li>
          <li><Link>Custom</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Footer