import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "#components/ui/carousel";
import { Button } from "#components/ui/button";
import { Badge } from "#components/ui/badge";
import video_banner1 from "../../assets/video-banner/banner3.mov";
import video_banner2 from "../../assets/video-banner/banner2.mov";
import video_banner3 from "../../assets/video-banner/banner1.mp4";
import { Link } from "react-router-dom";

const bannerData = [
  {
    id: "banner1",
    src: video_banner1,
    overlay: (
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
        <h1 className="font-black text-4xl leading-tight sm:text-6xl lg:text-7xl text-shadow-[0px_0px_20px_#A78BFA]">
          PRECISION TO VICTORY.
        </h1>
        <p className="mt-2 max-w-xl text-sm sm:text-base lg:text-lg">
          Precision gear designed for ultimate control. Upgrade today.
        </p>
        <Button
          variant="outline"
          className={
            "rounded-lg mt-8 sm:mt-12 lg:mt-20 px-6 py-3 sm:px-8 sm:py-5 text-sm sm:text-base shadow-lg shadow-gpurple-2 text-gpurple-2 inset-shadow-sm inset-shadow-gpurple-1"
          }
        >
          <Link to="/products">SHOP NOW {"⮞"}</Link>
        </Button>
      </div>
    ),
  },
  {
    id: "banner2",
    src: video_banner2,
    overlay: (
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
        <div>
          <Badge variant="outline" className={"bg-red-500/25 text-xs sm:text-sm"}>
            NEW ARRIVAL
          </Badge>
          <h2 className="font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-wide text-shadow-lg text-shadow-pink-500 my-2">
            GearVerse Magnetic Keyboard MK II
          </h2>
          <p className="uppercase font-bold text-sm sm:text-lg lg:text-xl">
            Light up your typing
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "banner3",
    src: video_banner3,
    overlay: (
      <div className="absolute inset-0 z-10 flex flex-col gap-3 justify-center items-center text-center text-white px-4 sm:px-6">
        <p className="font-extrabold tracking-wider text-sm sm:text-lg lg:text-xl text-shadow-xs text-shadow-pink-600">
          SPECIAL OFFER
        </p>
        <h1 className="font-black text-3xl sm:text-5xl lg:text-6xl bg-[#c42976] p-3 sm:p-4 rounded-2xl shadow-2xl shadow-[#bd427f]">
          BACK TO SCHOOL
        </h1>
        <h3 className="text-2xl sm:text-4xl font-semibold">
          GET{" "}
          <span className="text-4xl sm:text-5xl font-extrabold text-pink-400 underline">
            70%
          </span>{" "}
          OFF
        </h3>
      </div>
    ),
  },
];

const BannerSlide = ({ banner, index }) => {
  const { api } = useCarousel();
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!api) return;

    const update = () => setIsActive(api.selectedScrollSnap() === index);
    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api, index]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play();
    } else {
      video.pause();
    }
  }, [isActive]);

  const handleEnded = () => {
    if (videoRef.current) videoRef.current.currentTime = 0;
    api.scrollNext();
  };

  return (
    <CarouselItem className="relative overflow-hidden">
      {banner.overlay}
      <video
        ref={videoRef}
        className="border w-full h-[60svh] sm:h-[70svh] lg:h-175 object-cover"
        src={banner.src}
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
      ></video>
    </CarouselItem>
  );
};

const BannerCarousel = () => {
  return (
    <Carousel>
      <CarouselContent>
        {bannerData.map((banner, index) => (
          <BannerSlide key={banner.id} banner={banner} index={index} />
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default BannerCarousel;
