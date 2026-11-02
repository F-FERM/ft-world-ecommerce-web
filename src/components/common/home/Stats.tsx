import { cn } from "@/src/lib/utils";

const STATS = [
  { id: "ink-bottles", value: "150K+", label: "Ink Bottles Delivered" },
  { id: "b2b-clients", value: "42+", label: "B2B Corporate Clients" },
  { id: "timely-orders", value: "96%", label: "Orders Timely Delivered" },
  { id: "small-retails", value: "520+", label: "Small Retails Across India" },
];

interface StatsProps {
  className?: string;
}

const Stats = ({ className }: StatsProps) => {
  return (
    <section
      data-slot="stats"
      className={cn(
        "w-full bg-white px-4 sm:px-8 xl:px-12 2xl:px-0",
        "pb-12 pt-10 sm:pb-16 sm:pt-20 lg:pt-24 2xl:pt-20",
        className
      )}
    >
      <dl
        className={cn(
          "mx-auto grid w-full max-w-[1464px] grid-cols-2 gap-x-6 gap-y-10",
          "lg:flex lg:items-start lg:justify-between lg:gap-8"
        )}
      >
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center  text-center "
          >
            {/* Value */}
            <dd
              className={cn(
                "order-1  font-semibold uppercase leading-[100%] tracking-[0%] text-primary",
                "text-[36px] sm:text-[44px] md:text-[52px] xl:text-[58px] 2xl:text-[65px]"
              )}
            >
              {stat.value}
            </dd>

            {/* Label */}
            <dt
              className={cn(
                "order-2  font-semibold capitalize leading-[100%] tracking-[0%] text-[#353535]",
                "text-[14px] sm:text-[16px] 2xl:text-[18px]"
              )}
            >
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default Stats;