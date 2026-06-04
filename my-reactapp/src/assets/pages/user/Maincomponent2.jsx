export default function Maincomponent2() {
  return (
    <section className="bg-[#050505] text-white py-24 px-6 md:px-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="relative mb-24 border-b border-white/10 pb-12">
          <h2 className="text-[8vw] font-light leading-none tracking-tighter opacity-10 select-none">
            PHILOSOPHY
          </h2>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
            <p className="inline-block border border-white/30 px-4 py-2 text-sm md:text-lg font-light tracking-[0.2em] uppercase">
              Beyond the Standard
            </p>
          </div>
        </div>

        {/* Standardized Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          
          {/* Item 01 */}
          <div className="flex flex-col space-y-8">
            <div className="aspect-square overflow-hidden bg-zinc-900 border border-white/5">
              <img 
                src="/products/7.jpg" 
                alt="The Raw Material"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xl font-light tracking-widest uppercase">01. The Raw Material</h3>
              <p className="text-white/50 mt-4 max-w-md text-sm leading-relaxed">
                We source only from forests that breathe. Every grain tells a story of a century spent under the sun, now carved for your sanctuary.
              </p>
            </div>
          </div>

          {/* Item 02 */}
          <div className="flex flex-col space-y-8 md:mt-20">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-900 border border-white/5">
              <img 
                src="https://i.pinimg.com/736x/ed/a6/1a/eda61a0748005ed5ca9b3b5d7e36f0ff.jpg" 
                alt="Silent Design"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="pl-6 border-l border-white/20">
              <h3 className="text-xl font-light tracking-widest uppercase">02. Silent Design</h3>
              <p className="text-white/50 mt-4 text-sm leading-relaxed">
                True luxury doesn't scream. It settles into the corners of your life, providing comfort that feels like a natural law.
              </p>
            </div>
          </div>
        </div>

        {/* Centered Quote Section */}
        <div className="mt-32 text-center">
          <p className="text-xs tracking-[0.5em] text-white/30 uppercase mb-8">MT 40</p>
          <blockquote className="text-2xl md:text-4xl font-extralight tracking-tight max-w-3xl mx-auto leading-tight text-zinc-300">
            "Space is the breath of art, and <span className="text-white font-normal">Luxora</span> is the pulse within that breath."
          </blockquote>
          <div className="mt-12 flex flex-col items-center">
             <div className="h-[1px] w-12 bg-white/20" />
             <p className="text-[10px] tracking-[0.3em] text-white/20 mt-4 uppercase">EST. MMXXVI</p>
          </div>
        </div>

      </div>
    </section>
  );
}