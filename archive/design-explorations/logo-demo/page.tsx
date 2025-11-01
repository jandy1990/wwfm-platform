import { Geist, Space_Grotesk, Archivo_Black, Poppins, Rubik, Bebas_Neue, Oswald } from "next/font/google";

const geist = Geist({ subsets: ["latin"], weight: ["900"], variable: "--font-geist" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-space" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: ["400"], variable: "--font-archivo" });
const poppins = Poppins({ subsets: ["latin"], weight: ["900"], variable: "--font-poppins" });
const rubik = Rubik({ subsets: ["latin"], weight: ["900"], variable: "--font-rubik" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-bebas" });
const oswald = Oswald({ subsets: ["latin"], weight: ["700"], variable: "--font-oswald" });

const logoFonts = [
  { name: "Geist Black (Current)", variable: "--font-geist", description: "Your current font - clean but not distinctive" },
  { name: "Space Grotesk", variable: "--font-space", description: "Geometric with personality - unique letterforms stand out" },
  { name: "Archivo Black", variable: "--font-archivo", description: "Purpose-built display font - ultra bold and confident" },
  { name: "Poppins Black", variable: "--font-poppins", description: "Geometric sans with warmth - versatile and strong" },
  { name: "Rubik Black", variable: "--font-rubik", description: "Rounded geometric - friendly but bold" },
  { name: "Bebas Neue", variable: "--font-bebas", description: "Classic condensed display - very distinctive and powerful" },
  { name: "Oswald Bold", variable: "--font-oswald", description: "Condensed sans - classic logo font, slightly vintage feel" },
];

function LogoShowcase({ name, variable, description }: { name: string; variable: string; description: string }) {
  return (
    <div className="mb-12 pb-12 border-b border-gray-200 dark:border-gray-800">
      {/* Font Name */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Light Header Example */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Light Header</p>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-gray-900 flex items-start" style={{ fontFamily: `var(${variable})` }}>
                WWFM<span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 ml-1 mt-2"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Dark Header Example */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Dark Header</p>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white flex items-start" style={{ fontFamily: `var(${variable})` }}>
                WWFM<span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 ml-1 mt-2"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Large Light Background */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Hero Size (Light)</p>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 flex items-center justify-center">
            <span className="text-6xl font-black tracking-tight text-gray-900 flex items-start" style={{ fontFamily: `var(${variable})` }}>
              WWFM<span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 ml-2 mt-4"></span>
            </span>
          </div>
        </div>

        {/* Large Dark Background */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Hero Size (Dark)</p>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-8 flex items-center justify-center">
            <span className="text-6xl font-black tracking-tight text-white flex items-start" style={{ fontFamily: `var(${variable})` }}>
              WWFM<span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 ml-2 mt-4"></span>
            </span>
          </div>
        </div>

        {/* With Tagline (Light) */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">With Tagline</p>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
            <div className="text-center">
              <span className="text-5xl font-black tracking-tight text-gray-900 flex items-start justify-center mb-3" style={{ fontFamily: `var(${variable})` }}>
                WWFM<span className="inline-block w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 ml-1.5 mt-3.5"></span>
              </span>
              <p className="text-lg text-gray-600" style={{ fontFamily: "var(--font-geist-sans)" }}>
                What Works For Me
              </p>
            </div>
          </div>
        </div>

        {/* In Context - Full Header */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Full Header Context</p>
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 flex items-center border-b border-gray-200">
              <span className="text-2xl font-black tracking-tight text-gray-900 flex items-start" style={{ fontFamily: `var(${variable})` }}>
                WWFM<span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 ml-1 mt-2"></span>
              </span>
              <div className="flex-1"></div>
              <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-700">
                <a href="#" className="px-4 py-2 hover:text-purple-600">Explore</a>
                <a href="#" className="px-4 py-2 hover:text-purple-600">How It Works</a>
              </nav>
              <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold">
                Sign Up
              </button>
            </div>
            <div className="p-8 text-center">
              <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Find What Actually Works
              </h1>
              <p className="text-lg text-gray-600" style={{ fontFamily: "var(--font-geist-sans)" }}>
                See how the logo font pairs with Geist body text
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LogoDemoPage() {
  return (
    <div className={`${geist.variable} ${spaceGrotesk.variable} ${archivoBlack.variable} ${poppins.variable} ${rubik.variable} ${bebas.variable} ${oswald.variable} bg-gray-50 dark:bg-gray-950 min-h-screen`}>
      {/* Sticky Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-8 px-8 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">WWFM Logo Font Comparison</h1>
          <p className="text-purple-100">
            Compare logo fonts at different sizes and in real header context
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">
            What makes a great logo font?
          </h2>
          <ul className="space-y-2 text-purple-800 dark:text-purple-200">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
              <span><strong>Distinctive:</strong> Instantly recognizable and memorable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
              <span><strong>Scalable:</strong> Looks great small (header) and large (hero)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
              <span><strong>Complements Geist:</strong> Different enough to stand out, similar enough to feel cohesive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
              <span><strong>On-brand:</strong> Bold, confident, minimal - matches your design system</span>
            </li>
          </ul>
        </div>

        {logoFonts.map((font) => (
          <LogoShowcase key={font.name} {...font} />
        ))}

        {/* Recommendation Box */}
        <div className="mt-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-black mb-4">My Recommendations</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-1">🏆 Top Pick: Space Grotesk</h4>
              <p className="text-purple-100">Most distinctive while staying modern. The unique letterforms make "WWFM" really pop without being gimmicky.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">🥈 Runner-up: Bebas Neue</h4>
              <p className="text-purple-100">Classic display font with serious brand power. Very recognizable, but might feel too "branding agency" for some.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">🥉 Safe Choice: Poppins Black</h4>
              <p className="text-purple-100">If you want bold but not too different from Geist. Geometric, versatile, professional.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
