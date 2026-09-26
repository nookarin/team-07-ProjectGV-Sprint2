import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Minus,
  Plus,
  Heart,
  Star,
  Truck,
  Shield,
  Check,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { soundEngine } from "../../utils/audio";
import { addToCart } from "#lib/cart-service";
import CustomKeyboardLOLDImg from "../../assets/custom_keyboard_lol_collab.png";
import CustomKeyboardLOLWhiteImg from "../../assets/custom_keyboard_lol_white.png";
import CustomKeyboardLOLPurpleImg from "../../assets/custom_keyboard_lol_purple.png";
import CustomKeyboardLOLPinkImg from "../../assets/custom_keyboard_lol_pink.png";
import CustomKeyboardLOLSpecsImg from "../../assets/custom_keyboard_lol_specs_collab.png";
import CustomMousepadTeemoImg from "../../assets/custom_mousepad_teemo_collab.png";
import CustomMousepadTeemoRunImg from "../../assets/custom_mousepad_teemo_run.png?v=3";
import MouseImg from "../../assets/image-product/Gemini_Generated_Image_cfukikcfukikcfuk.jpg";
import HeadsetImg from "../../assets/image-product/Gemini_Generated_Image_waq5aswaq5aswaq5.jpg";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

const PRODUCT_NAME = "League of Legends X GEARVERSE";
const UNIT_PRICE = 399;

const SWITCH_OPTIONS = [
  {
    id: "linear",
    label: "Linear",
    name: "titan linear (45g)",
    weight: "45g ± 5g",
    dot: "#EF4444",
  },
  {
    id: "tactile",
    label: "Tactile",
    name: "titan tactile brown (55g)",
    weight: "55g ± 5g",
    dot: "#D97706",
  },
  {
    id: "clicky",
    label: "Clicky",
    name: "titan clicky blue (60g)",
    weight: "60g ± 5g",
    dot: "#00FFFF",
  },
];

const RELATED_PRODUCTS = [
  {
    id: "vortex-wireless-mouse",
    name: "Vortex Wireless Mouse",
    image: MouseImg,
    price: 129,
    to: "/products/mouse",
    badge: "NEW",
  },
  {
    id: "sonic-pro-headset",
    name: "Sonic Pro Headset",
    image: HeadsetImg,
    price: 189,
    oldPrice: 219,
    to: "/products/headset",
  },
  {
    id: "cyber-desk-mat",
    name: "Cyber Desk Mat",
    image: CustomMousepadTeemoImg,
    price: 39,
    to: "/products/custom",
  },
];

const ProductPage = () => {
  const navigate = useNavigate();
  const param = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(null);
  const { url } = useAuth();
  // Array of placeholder images for gallery
  const images = [
    CustomKeyboardLOLDImg, // 0 (Black)
    CustomKeyboardLOLWhiteImg, // 1 (White)
    CustomKeyboardLOLPurpleImg, // 2 (Purple)
    CustomKeyboardLOLPinkImg, // 3 (Pink)
    CustomKeyboardLOLSpecsImg, // 4
    CustomMousepadTeemoImg, // 5
    CustomMousepadTeemoRunImg, // 6
  ];

  const colors = [
    { id: "black", name: "BLACK", hex: "#000000", image: images[0] },
    { id: "white", name: "WHITE", hex: "#ffffff", image: images[1] },
    { id: "purple", name: "PURPLE", hex: "#E9D5FF", image: images[2] },
    { id: "pink", name: "PINK", hex: "#F472B6", image: images[3] },
  ];

  // State for selected options
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [activeImage, setActiveImage] = useState(colors[0].image);
  const [activeSwitch, setActiveSwitch] = useState(SWITCH_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [playingSwitch, setPlayingSwitch] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(
      `${url}/products/product/${param.product_id}`,
    );
    setData(response.data.product);
    setLoading(false);
  };
  // ออกจากหน้านี้แล้วเสียงต้องไม่ค้าง
  useEffect(() => {
    () => soundEngine.stop();
    fetchData();
  }, []);

  const startPreview = (switchId) => {
    setPlayingSwitch(switchId);
    soundEngine.playSwitchSound(switchId, (endedId) =>
      setPlayingSwitch((current) => (current === endedId ? null : current)),
    );
  };

  // กดปุ่มลำโพงครั้งแรก = เล่น กดปุ่มเดิมซ้ำ = หยุด
  const togglePreview = (switchId) => {
    if (playingSwitch === switchId) {
      soundEngine.stop();
      setPlayingSwitch(null);
      return;
    }
    startPreview(switchId);
  };

  const handleSwitchSelect = (option) => {
    setActiveSwitch(option);
    startPreview(option.id);
  };

  const handleColorChange = (color) => {
    setActiveColor(color);
    setActiveImage(color.image);
  };

  // เลือกจาก thumbnail แล้วให้ swatch สีอัปเดตตามด้วย ถ้ารูปนั้นเป็นรูปของสี
  const handleImageSelect = (img) => {
    setActiveImage(img);
    const matchingColor = colors.find((color) => color.image === img);
    if (matchingColor) setActiveColor(matchingColor);
  };

  const handleWishlistToggle = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    toast[next ? "success" : "info"](
      next ? "Added to your wishlist" : "Removed from your wishlist",
      { richColors: true, position: "top-center" },
    );
  };

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => {
      const newCount = prev + increment;
      if (newCount >= 1 && newCount <= 10) return newCount;
      return prev;
    });
  };

  // ตัวเลือก switch มีความหมายเฉพาะสินค้าประเภท keyboard เท่านั้น
  // สินค้าประเภทอื่น (mouse, headset, ...) จะไม่แสดงส่วนนี้
  const isKeyboard =
    data?.category_id?.category_name?.toLowerCase() === "keyboard";

  const handleAddToCart = () => {
    addToCart({
      id: `lol-gearverse-${activeSwitch.id}-${activeColor.id}`,
      name: PRODUCT_NAME,
      tag: `${activeSwitch.name} • ${activeColor.name}`,
      unitPrice: UNIT_PRICE,
      quantity,
      delivery: "Est. Delivery: 2-3 Business Days",
      image: activeImage,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#BF00FF", "#00FFFF", "#FF007F"],
    });

    toast.success(`Added ${quantity} × ${PRODUCT_NAME} to your cart`, {
      action: {
        label: "View cart",
        onClick: () => navigate("/cart"),
        position: "top-center",
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07070A] font-['Kanit'] text-white overflow-x-hidden selection:bg-[#BF00FF] selection:text-white">
      {/* Show full-screen LoadingScreen while the product API request is being fetched */}
      {loading && <LoadingScreen />}
      {/* Top Announcement Banner */}
      <div className="bg-[#0A0A0A] border-b border-[#1C1C24] py-1.5 px-4 text-center text-[10px] font-medium tracking-wide text-[#8A8A93] flex items-center justify-center gap-2">
        <Star className="w-3 h-3 text-[#00FFFF] fill-[#00FFFF]" />
        <span>
          STUDIO PRECISION 2026: GET 20% OFF ON LEAGUE OF LEGENDS X GEARVERSE
          WITH CODE{" "}
          <strong className="text-[#00FFFF] font-mono font-semibold">
            GEAR15
          </strong>
        </span>
      </div>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 md:py-16 flex flex-col gap-8 lg:gap-12">
        {/* Top Section: Image & Details */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 w-full">
          {/* Left Side: Images */}
          <div className="flex flex-col w-full lg:w-[60%] xl:w-[720px] gap-4">
            {/* Main Image Box */}
            <div className="w-full aspect-video lg:aspect-auto lg:h-[460px] bg-[#0C0C12] border border-[#2a2a35] rounded-xl flex items-center justify-center overflow-hidden relative group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#A78BFA]/10 to-[#00FFFF]/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
              {!loading && (
                <img
                  src={data.image_url}
                  alt={data.product_name}
                  className="w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}
            </div>

            {/* Thumbnails Gallery */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!loading &&
                data.images?.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleImageSelect(img)}
                    className={`w-full aspect-video rounded-[8px] overflow-hidden border-2 cursor-pointer transition-all hover:opacity-100 ${
                      activeImage === img
                        ? "border-[#00FFFF] opacity-100"
                        : "border-[#2a2a35] opacity-50 hover:border-[#A78BFA]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-contain bg-black/40"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Right Details */}
          <div className="flex flex-col gap-6 lg:gap-8 w-full lg:w-[40%] xl:flex-1 pt-0 lg:pt-2">
            {/* Title & Price */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <h1 className="text-[28px] font-bold leading-none text-white tracking-wide">
                  {data.product_name}
                </h1>
                <div className="px-2 py-0.5 border border-[#00FFFF] bg-[#00FFFF]/10 rounded-[2px] mt-1 hidden sm:block">
                  <span className="text-[8px] font-black tracking-widest text-[#00FFFF]">
                    IN STOCK
                  </span>
                </div>
              </div>

              {/* Reviews */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < 4 ? "fill-[#00FFFF] text-[#00FFFF]" : "fill-[#2a2a35] text-[#2a2a35]"} `}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#8A8A93] border-b border-[#8A8A93]/50 cursor-pointer hover:text-[#00FFFF] transition-colors ml-1">
                  (128 Reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <span className="text-[22px] font-extrabold text-[#9F7AEA]">
                  {data.price} $
                </span>
                {/* <span className="text-[13px] font-medium text-[#8A8A93] line-through pt-1.5">
                  479 $
                </span>
                <div className="px-2 py-0.5 bg-[#F97316] rounded-[2px] mt-1.5">
                  <span className="text-[8px] font-black tracking-widest text-white">
                    20% OFF
                  </span>
                </div> */}
              </div>
            </div>

            {/* Switch Selector — เฉพาะสินค้าประเภท keyboard */}
            {isKeyboard && (
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-[1.5px] uppercase text-[#8A8A93]">
                  <span>SELECT SWITCH TYPE</span>
                  <span className="text-[#00FFFF] lowercase">
                    {activeSwitch.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SWITCH_OPTIONS.map((option) => {
                    const isActive = activeSwitch.id === option.id;
                    const isPlaying = playingSwitch === option.id;

                    return (
                      <div
                        key={option.id}
                        className={`relative rounded-[12px] border overflow-hidden transition-all h-[85px] ${isActive ? "border-[#00FFFF] bg-[#181423] shadow-[0_0_8px_rgba(0,255,255,0.15)]" : "border-[#2a2a35] bg-[#0C0C12] hover:bg-[#120F1A]"}`}
                      >
                        {/* เลือกชนิด switch (คลิกที่การ์ด) */}
                        <button
                          onClick={() => handleSwitchSelect(option)}
                          aria-pressed={isActive}
                          className="absolute inset-0 p-3 text-left cursor-pointer flex flex-col justify-between"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: option.dot }}
                          ></div>
                          <div className="mt-auto">
                            <div
                              className={`text-[12px] font-semibold capitalize ${isActive ? "text-white" : "text-white/80"}`}
                            >
                              {option.label}
                            </div>
                            <div className="text-[10px] text-[#8A8A93] font-mono mt-0.5">
                              {option.weight}
                            </div>
                          </div>
                        </button>

                        {/* ฟังเสียง กดซ้ำที่ปุ่มเดิมเพื่อหยุด */}
                        <button
                          onClick={() => togglePreview(option.id)}
                          aria-pressed={isPlaying}
                          aria-label={`${isPlaying ? "Stop" : "Play"} ${option.label} switch sound`}
                          title={isPlaying ? "Stop sound" : "Play sound"}
                          className={`absolute top-2 right-2 z-10 p-1 rounded-[6px] cursor-pointer transition-colors ${isPlaying ? "text-[#00FFFF] bg-[#00FFFF]/10" : "text-[#8A8A93] hover:text-white hover:bg-white/10"}`}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            <div className="flex flex-col gap-4 mt-1">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-white">
                COLOR: {activeColor.name}
              </span>
              <div className="flex items-center gap-3">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-[12px] cursor-pointer hover:scale-110 transition-all ${activeColor.id === color.id ? "border-2 border-[#9F7AEA] p-[2px]" : "border border-[#2a2a35] hover:border-[#9F7AEA]"}`}
                  >
                    <div
                      className={`w-full h-full rounded-[8px]`}
                      style={{ backgroundColor: color.hex }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-3 mt-1">
              <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-white">
                QUANTITY
              </span>
              <div className="flex items-center bg-[#181423] border border-[#9F7AEA]/50 hover:border-[#9F7AEA] transition-colors rounded-[6px] w-[90px] h-[32px] px-1 gap-1">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/5 rounded-[4px] transition-colors text-[#8A8A93] hover:text-white"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="text-[12px] font-medium w-6 text-center text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-white/5 rounded-[4px] transition-colors text-[#8A8A93] hover:text-white"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#9F7AEA] hover:bg-[#8B5CF6] transition-all h-[44px] rounded-[4px] flex items-center justify-center font-bold text-[14px] tracking-wide shadow-[0_0_15px_rgba(159,122,234,0.4)] relative overflow-hidden group"
              >
                <span className="relative z-10">
                  Add to cart – {UNIT_PRICE * quantity} $
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </button>
              <button
                onClick={handleWishlistToggle}
                aria-pressed={isWishlisted}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className={`w-[44px] h-[44px] border bg-[#0C0C12] rounded-[4px] flex items-center justify-center transition-colors group ${isWishlisted ? "border-[#9F7AEA] bg-[#9F7AEA]/10" : "border-[#2a2a35] hover:border-[#9F7AEA] hover:bg-[#9F7AEA]/10"}`}
              >
                <Heart
                  className={`w-4 h-4 transition-all ${isWishlisted ? "text-[#9F7AEA] fill-[#9F7AEA]" : "text-[#8A8A93] group-hover:text-[#9F7AEA] group-hover:fill-[#9F7AEA]/20"}`}
                />
              </button>
            </div>

            {/* Product Perks (E-commerce additions) */}
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#1C1C24]">
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 text-[#00FFFF]" />
                <span className="text-[10px] text-white/80">
                  Free worldwide shipping over 100$
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-[#00FFFF]" />
                <span className="text-[10px] text-white/80">
                  2-Year manufacturer warranty
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-[#00FFFF]" />
                <span className="text-[10px] text-white/80">
                  30-day money-back guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Features / Tags */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-4">
          {!loading && data.subcategory_ids ? (
            data?.subcategory_ids.map((item) => {
              return (
                <div
                  key={item._id}
                  className="px-5 py-1.5 bg-[#0C0C12] border border-[#2a2a35] rounded-full hover:border-[#9F7AEA] transition-colors cursor-pointer group"
                >
                  <span className="text-[9px] font-bold tracking-[1.5px] upper text-white group-hover:text-[#9F7AEA] transition-colors">
                    {item.subcategory_name}
                  </span>
                </div>
              );
            })
          ) : (
            <p>loading..</p>
          )}
        </div>

        {/* Description & Specs Block */}
        <div className="w-full bg-[#0C0C12] border border-[#2a2a35] rounded-lg overflow-hidden flex flex-col md:flex-row mt-2">
          {/* Left: General Desc */}
          <div className="flex flex-col flex-1 border-b md:border-b-0 md:border-r border-[#2a2a35]">
            <div className="h-[48px] bg-[#A78BFA] flex items-center px-6 border-b border-[#A78BFA]">
              <h2 className="text-[15px] font-bold text-white tracking-wide">
                Description
              </h2>
            </div>
            <div className="p-5 md:p-8 min-h-[120px] flex items-center">
              <p className="text-[12px] md:text-[13px] text-white/90 font-light leading-[1.8] max-w-[800px]">
                Built with a solid aluminum frame, durable PBT double-shot
                keycaps, and multi-device <br className="hidden md:block" />
                Bluetooth connectivity to conquer both gaming and work. Equipped
                with state-of-the-art optical switches for ultra-rapid
                actuation.
              </p>
            </div>
          </div>

          {/* Right: Technical Specs */}
          <div className="flex flex-col flex-1 bg-[#09090D]">
            <div className="h-[48px] bg-transparent flex items-center px-6 border-b border-[#2a2a35]">
              <h2 className="text-[13px] font-bold text-[#8A8A93] tracking-wide">
                Technical Specifications
              </h2>
            </div>
            <div className="p-5 md:p-8 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#1C1C24] pb-2">
                <span className="text-[11px] text-[#8A8A93]">Switch Type</span>
                <span className="text-[11px] text-white font-medium">
                  Titan Optical Linear
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1C1C24] pb-2">
                <span className="text-[11px] text-[#8A8A93]">Connectivity</span>
                <span className="text-[11px] text-white font-medium">
                  Bluetooth 5.1 / 2.4GHz / USB-C
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1C1C24] pb-2">
                <span className="text-[11px] text-[#8A8A93]">Battery Life</span>
                <span className="text-[11px] text-white font-medium">
                  Up to 200 Hours
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Products Section */}
      {/* <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#00FFFF] shadow-[0_0_8px_#00FFFF]"></div>
            <h2 className="text-[16px] font-bold uppercase tracking-[1.5px]">
              You Might Also Like
            </h2>
          </div>
          <Link
            to="/products/all"
            className="flex items-center gap-1.5 text-[10px] text-[#00FFFF] hover:text-white transition-colors group"
          >
            VIEW MORE{" "}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RELATED_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to={product.to}
              className="bg-[#0C0C12] border border-[#2a2a35] rounded-xl overflow-hidden hover:border-[#9F7AEA] transition-all group"
            >
              <div className="aspect-[4/3] bg-[#181423] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 relative">
                {product.badge && (
                  <div className="absolute -top-4 right-4 bg-[#00FFFF] text-black text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-[0_0_8px_rgba(0,255,255,0.4)]">
                    {product.badge}
                  </div>
                )}
                <h3 className="text-[14px] font-bold text-white group-hover:text-[#9F7AEA] transition-colors">
                  {product.name}
                </h3>
                {product.oldPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-extrabold text-[#9F7AEA]">
                      {product.price} $
                    </span>
                    <span className="text-[10px] text-[#8A8A93] line-through">
                      {product.oldPrice} $
                    </span>
                  </div>
                ) : (
                  <span className="text-[13px] font-medium text-[#8A8A93]">
                    {product.price} $
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default ProductPage;
