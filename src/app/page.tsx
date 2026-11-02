import BuildBundle from "../components/common/home/BuildYourOwnBundle";
import BusinessBanner from "../components/common/home/BusinessBanner";
import BusinessSupplies from "../components/common/home/BusinessSupplies";
import FeaturesStrip from "../components/common/home/Features";
import Hero from "../components/common/home/Hero";
import Newsletter from "../components/common/home/NewsLetter";
import PopularProducts from "../components/common/home/PopularProducts";
import ShopByCategory from "../components/common/home/ShopByCategory";
import Stats from "../components/common/home/Stats";

export default function Home() {
  return (
  
      <main>
      <Hero/>
      <Stats/>
      <ShopByCategory/>
      <BusinessBanner/>
      <PopularProducts/>
      <BusinessSupplies/>
      <BuildBundle/>
      <Newsletter/>
      <FeaturesStrip/>
      </main>
  );
}
