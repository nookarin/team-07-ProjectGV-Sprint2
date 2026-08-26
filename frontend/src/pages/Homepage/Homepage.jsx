import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#components/ui/carousel";
import video_banner1 from "../../assets/video-banner/copy_B3CBA178-E897-4019-BF2D-C07B2A17848C.mov";
import video_banner2 from "../../assets/video-banner/VID_25690825114533503.mov";
import video_banner3 from "../../assets/video-banner/วิดีโอแบนเนอร์เกี่ยวกับ gaming gear โทนดำและม่วงนีออน, ลุคเทคโนโลยีล้ำสมัย, พลังงานสูง, สไตล์เกมมิ่ง.mp4";
import { Card, CardContent } from "#components/ui/card";
import { Button } from "#components/ui/button";
import img_cate1 from "../../assets/image-category/Gemini_Generated_Image_hh5i48hh5i48hh5i.jpg";
import img_cate2 from "../../assets/image-category/Gemini_Generated_Image_k7cgvsk7cgvsk7cg.jpg";
import img_cate3 from "../../assets/image-category/Gemini_Generated_Image_pjqv70pjqv70pjqv.jpg";
import img_cate4 from "../../assets/image-category/Gemini_Generated_Image_rex7yirex7yirex7.jpg";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import ProductCard from "#components/Homepage/ProductCard";
import CategoryCard from "#components/Homepage/CategoryCard";
import Autoplay from "embla-carousel-autoplay";
const Homepage = () => {
  return (
    <div className="bg-[#0A0A0F]">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent>
          <CarouselItem>
            <Card
              className={
                "ring-0 absolute -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2"
              }
            >
              <CardContent
                className={
                  "h-80 flex flex-col items-center justify-between text-center text-white"
                }
              >
                <div>
                  <h1 className="font-black text-7xl text-shadow-[0px_0px_20px_#22D3EE]">
                    PRECISION TO VICTORY.
                  </h1>
                  <p>
                    Precision gear designed for ultimate control. Upgrade
                    today.A78BFA
                  </p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className={
                      "rounded-lg px-8 py-5 shadow-lg shadow-[#A78BFA] inset-shadow-sm inset-shadow-[#A78BFA]"
                    }
                  >
                    SHOP NOW {">"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <video
              className="border w-full h-175 object-cover"
              src={video_banner1}
              muted
              autoPlay
            ></video>
          </CarouselItem>
          <CarouselItem>
            <video
              className="border w-full h-175 object-cover"
              src={video_banner2}
              muted
              autoPlay
            ></video>
          </CarouselItem>
          <CarouselItem>
            <video
              className="border w-full h-175 object-cover"
              src={video_banner3}
              muted
              autoPlay
            ></video>
          </CarouselItem>
        </CarouselContent>
        {/* <CarouselPrevious /> */}
        {/* <CarouselNext /> */}
      </Carousel>
      <div className="w-3/4 mx-auto my-10">
        <div>
          <h2 className="text-white font-bold text-xl mb-8">
            <span className="text-[#A78BFA] font-black">—</span> CATEGORIES
          </h2>
          <div className="grid grid-cols-2 ">
            <CategoryCard img={img_cate1} />
            <CategoryCard img={img_cate2} />
            <CategoryCard img={img_cate3} />
            <CategoryCard img={img_cate4} />
          </div>
        </div>
      </div>
      <div className="w-3/4 mx-auto py-10">
        <h2 className="text-white font-bold text-xl mb-8">
          <span className="text-[#A78BFA] font-black">—</span> TRENDING GEAR
        </h2>
        <div className="grid grid-cols-3 gap-12 text-white">
          <ProductCard img={img_cate1} />
          <ProductCard img={img_cate2} />
          <ProductCard img={img_cate3} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;
