import Hero from "@/components/sections/hero";
import Manifesto from "@/components/sections/manifesto";
import Atlas from "@/components/sections/atlas";
import Capability from "@/components/sections/capability";
import Trajectory from "@/components/sections/trajectory";
import Work from "@/components/sections/work";
import Console from "@/components/sections/console";
import Contact from "@/components/sections/contact";
import Universe from "@/components/sections/universe";

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Atlas />
      <Capability />
      <Trajectory />
      <Work />
      <Console />
      <Contact />
      <Universe />
    </>
  );
}
