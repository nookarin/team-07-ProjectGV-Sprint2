import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#components/ui/carousel"
import video_banner1 from '../../assets/video-banner/copy_B3CBA178-E897-4019-BF2D-C07B2A17848C.mov'
import video_banner2 from '../../assets/video-banner/VID_25690825114533503.mov'
import video_banner3 from '../../assets/video-banner/วิดีโอแบนเนอร์เกี่ยวกับ gaming gear โทนดำและม่วงนีออน, ลุคเทคโนโลยีล้ำสมัย, พลังงานสูง, สไตล์เกมมิ่ง.mp4'
import { Card, CardContent } from '#components/ui/card'
import { Button } from '#components/ui/button'

const Homepage = () => {
  return (
    <div className='bg-[#0A0A0F]'>
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <Card className={'ring-0 absolute -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2'}>
              <CardContent className={'h-80 flex flex-col items-center justify-between text-center text-white'}>
                <div>
                  <h1 className='font-black text-7xl text-shadow-[0px_0px_20px_#22D3EE]'>PRECISION TO VICTORY.</h1>
                  <p>Precision gear designed for ultimate control. Upgrade today.A78BFA</p>
                </div>
                <div>
                  <Button variant='outline' className={'rounded-lg px-8 py-5 shadow-lg shadow-[#A78BFA] inset-shadow-sm inset-shadow-[#A78BFA]'}>SHOP NOW {'>'}</Button>
                </div>
              </CardContent>
            </Card>
            <video className='border w-full h-175 object-cover' src={video_banner1} muted autoPlay></video>
          </CarouselItem>
          <CarouselItem>
            <video className='border w-full h-175 object-cover' src={video_banner2} muted autoPlay></video>
          </CarouselItem>
          <CarouselItem>
            <video className='border w-full h-175 object-cover' src={video_banner3} muted autoPlay></video>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default Homepage