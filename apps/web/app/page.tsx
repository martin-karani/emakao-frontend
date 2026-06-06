import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Perspectives } from "@/components/perspectives";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30">
      <Hero />
      <Features />
      <Perspectives />
      <Footer />
    </main>
  );
}

