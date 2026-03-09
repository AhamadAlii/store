import Hero from "@/components/layout/Hero";
import StoreStatus from "@/components/ui/StoreStatus";
import Announcement from "@/components/ui/Announcement";
import HowPickupWorks from "@/components/layout/HowPickupWorks";
import BrowseButton from "@/components/ui/BrowseButton";


export default function Home() {
  return (
    <main>
      <Hero />
      <StoreStatus />
      <Announcement />
      <HowPickupWorks />
      <BrowseButton />
    </main>
  );
}