import Footer from "./_components/footer";
import Hero from "./_components/hero";
import Navbar from "./_components/navbar";

const LandingPage = () => {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex felx-col item-center justify-center md:justify-start text-center gap-y-2 flex-1 px-6 py-10" >
        <Hero/>
      </div>
      <Footer/>
    </div>
  );
}

export default LandingPage;
