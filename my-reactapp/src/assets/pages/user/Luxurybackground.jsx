export default function Luxurybackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0f0e0d]">


      {/* Base Luxury Gradient */}
      <div className="
        absolute inset-0
        bg-gradient-to-br
        from-[#0f0e0d]
        via-[#1a1714]
        to-[#0b0a09]
      " />

      {/* Animated Gradient Mesh */}
      <div className="
        absolute -inset-[20%]
        opacity-40
        blur-3xl
        animate-gradientShift
        bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.25),transparent_40%),
             radial-gradient(circle_at_70%_60%,rgba(180,140,60,0.18),transparent_45%),
             radial-gradient(circle_at_50%_80%,rgba(255,215,140,0.15),transparent_50%)]
      " />

      {/* Floating Gold Light Blob 1 */}
      <div className="
        absolute top-1/4 left-1/4
        w-[500px] h-[500px]
        bg-[#d4af37]
        opacity-20
        blur-[140px]
        rounded-full
        animate-floatSlow
      " />

      {/* Floating Gold Light Blob 2 */}
      <div className="
        absolute bottom-1/4 right-1/4
        w-[420px] h-[420px]
        bg-[#b8962e]
        opacity-20
        blur-[120px]
        rounded-full
        animate-floatDiagonal
      " />

      {/* Luxury Noise Texture */}
      <div className="
        absolute inset-0
        opacity-[0.035]
        mix-blend-overlay
        pointer-events-none
        bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
      " />

    </div>
  );
}
