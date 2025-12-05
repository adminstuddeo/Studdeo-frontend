import React from 'react';

const WaveDivider: React.FC = () => {
  const studdeoYellowHex = "#FFC300";

  // La línea superior está separada en un path aparte (solo stroke)
  const wavePathTop =
    "M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,106.7C672,85,768,107,864,138.7C960,171,1056,213,1152,213.3C1248,213,1344,171,1392,149.3L1440,128";

  // El relleno violeta utiliza la misma forma, pero extendida hacia abajo y cerrada sin stroke.
  const waveFillPath =
    wavePathTop + "L1440,320L0,320Z";

  return (
    <div className="relative w-full h-32 text-studdeo-violet -mb-1">
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >

        {/* RELLENO violeta */}
        <path
          d={waveFillPath}
          fill="currentColor"
        />

        {/* SOLO la línea superior — más gruesa */}
        <path
          d={wavePathTop}
          fill="none"
          stroke={studdeoYellowHex}
          strokeWidth="18"         // ← controla el grosor
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    </div>
  );
};

export default WaveDivider;
