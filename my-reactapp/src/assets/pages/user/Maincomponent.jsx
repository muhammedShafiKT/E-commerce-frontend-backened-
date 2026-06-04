import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Maincomponent() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    
      <section className="relative min-h-screen w-full">


        <img
          src="https://images.unsplash.com/photo-1505691938895-1758d7feb511"
          onLoad={() => setLoaded(true)}
          className={`
            absolute inset-0 w-full h-full object-cover
            transition duration-[2000ms]
            will-change-transform
            ${loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"}
          `}
          style={{
            transform: `translateY(${scrollY * 0.15}px)`
          }}
        />

  
        <div className="
          absolute inset-0
          bg-gradient-to-b
          from-black/40
          via-black/30
          to-black/70
        " />

      
        <div className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]
        " />

       
        <div className="
          relative z-10
          min-h-screen
          flex flex-col
          items-center
          justify-center
          text-center
          px-6
        ">
          <h1 className="
            text-6xl md:text-8xl
            font-semibold
            tracking-tight
            text-white
            animate-fadeUp
          ">
            Luxora
          </h1>

          <p className="
            mt-6
            text-white/80
            tracking-widest
            text-sm md:text-base
            animate-fadeUp delay-200
          ">
            ONLINE STORE OF FURNITURE INSPIRED BY NATURE
          </p>

          <button 
          onClick={()=>navigate("/products")}
          className="
            mt-10
            px-10 py-3
            border border-white/40
            rounded-full
            text-white
            tracking-widest text-sm
            backdrop-blur-md
            hover:bg-white hover:text-black
            transition duration-500
            animate-fadeUp delay-300
          ">
            EXPLORE COLLECTION
          </button>
        </div>

      

      </section>

      
    </>
  );
}
