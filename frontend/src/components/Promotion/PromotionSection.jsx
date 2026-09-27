import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#components/ui/carousel";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { cn } from "@/lib/utils";

const ACCENTS = [
  "from-gpink-2 via-gpurple-3 to-gpurple-5",
  "from-gcyan-dark via-gpurple-3 to-gpurple-5",
  "from-gpurple-2 via-gpurple-4 to-gpink-3",
  "from-gpurple-3 via-gpink-2 to-gpurple-4",
];

const formatBaht = (value) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(
    value || 0,
  );

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const discountLabel = (promo) =>
  promo.discount_type === "baht"
    ? `฿${formatBaht(promo.discount_amount)}`
    : `${promo.discount_amount}%`;

const CouponTicket = ({ promo, accent, onCopy, copied }) => {
  return (
    <div
      className={cn(
        "group relative flex w-full items-stretch overflow-hidden rounded-2xl",
        "bg-linear-to-br bg-gpurple-5",
        // accent,
        "text-white", // shadow-sm shadow-purple-900/40
        "transition-transform duration-300 hover:-translate-y-1",
      )}
    >
      {/* <div className="pointer-events-none absolute -top-10 -left-8 size-24 rounded-full bg-white/20 blur-2xl" /> */}

      <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-white/30">
          <Sparkles className="size-3" />
          {discountLabel(promo)} off
        </span>

        <p className="line-clamp-2 text-xs font-light text-white/85">
          {promo.description || "Valid on all items"}
        </p>

        <p className="text-[11px] text-white/75">
          Min. spend ฿{formatBaht(promo.min_order_price)}
        </p>
      </div>

      <div className="relative w-0 shrink-0 self-stretch">
        <div className="h-full border-l-2 border-dashed border-white/45" />
        <span className="absolute top-0 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gbg-3" />
        <span className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-gbg-3" />
        <span className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gbg-3" />
      </div>

      <div className="relative flex w-28 shrink-0 flex-col items-center justify-center gap-1 px-2 py-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/70">
          Code
        </p>
        <p className="font-mono text-sm font-bold break-all uppercase">
          {promo.name}
        </p>
        <button
          type="button"
          onClick={() => onCopy(promo.name)}
          className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium transition-colors hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <p className="mt-1 text-[10px] text-white/70">
          Exp. {formatDate(promo.expire_at)}
        </p>
      </div>
    </div>
  );
};

const ARROW_BUTTON =
  "border-gpurple-2 bg-gbg-2 text-white hover:bg-gpurple-4 hover:text-white";

const PromotionSection = () => {
  const { url } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await axios.get(`${url}/promo`);
        setPromos(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, [url]);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Copied "${code}" to clipboard`, { richColors: true });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Could not copy the code", { richColors: true });
    }
  };

  if (loading) return null;

  if (promos.length === 0) return null;

  return (
    <Carousel opts={{ align: "start" }}>
      <CarouselPrevious
        className={cn("-left-3 lg:-left-12", ARROW_BUTTON)}
        aria-label="Previous promotions"
      />
      <CarouselNext
        className={cn("-right-3 lg:-right-12", ARROW_BUTTON)}
        aria-label="Next promotions"
      />

      <CarouselContent className="py-2">
        {promos.map((promo, index) => (
          <CarouselItem
            key={promo._id}
            className="basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <CouponTicket
              promo={promo}
              accent={ACCENTS[index % ACCENTS.length]}
              onCopy={handleCopy}
              copied={copiedCode === promo.name}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default PromotionSection;
