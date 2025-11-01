import { Geist } from "next/font/google";
import { Space_Grotesk, Outfit, Inter, Plus_Jakarta_Sans } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

const fonts = [
  { name: "Geist (Current)", font: geist, variable: "--font-geist" },
  { name: "Space Grotesk", font: spaceGrotesk, variable: "--font-space" },
  { name: "Outfit", font: outfit, variable: "--font-outfit" },
  { name: "Inter", font: inter, variable: "--font-inter" },
  { name: "Plus Jakarta Sans", font: plusJakarta, variable: "--font-jakarta" },
];

function FontSection({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="mb-20">
      {/* Light Background */}
      <div className="bg-white py-20 px-8" style={{ fontFamily: `var(${variable})` }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
            {name} - Light Background
          </p>

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6">
            Find What Actually Works
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl">
            Discover real solutions from real people. WWFM aggregates effectiveness ratings
            to show you what worked for others facing the same challenges.
          </p>

          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-8">
            Popular Solutions
          </h2>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Meditation Apps
              </h3>
              <p className="text-gray-600 mb-4">
                Track anxiety levels with guided sessions and breathing exercises.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-600">4.5</span>
                <span className="text-gray-500 font-medium">★★★★☆</span>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                CBT Therapy
              </h3>
              <p className="text-gray-600 mb-4">
                Professional cognitive behavioral therapy for lasting change.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-600">4.8</span>
                <span className="text-gray-500 font-medium">★★★★★</span>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Exercise Routine
              </h3>
              <p className="text-gray-600 mb-4">
                Regular movement improves mood and reduces stress levels.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-600">4.3</span>
                <span className="text-gray-500 font-medium">★★★★☆</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md hover:bg-purple-700 hover:shadow-xl transition-all">
              Browse Solutions
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all">
              Share What Worked
            </button>
          </div>
        </div>
      </div>

      {/* Dark Background */}
      <div className="bg-gray-900 py-20 px-8" style={{ fontFamily: `var(${variable})` }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wide">
            {name} - Dark Background
          </p>

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
            Find What Actually Works
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-12 max-w-3xl">
            Discover real solutions from real people. WWFM aggregates effectiveness ratings
            to show you what worked for others facing the same challenges.
          </p>

          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-8">
            Popular Solutions
          </h2>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-white mb-3">
                Meditation Apps
              </h3>
              <p className="text-gray-300 mb-4">
                Track anxiety levels with guided sessions and breathing exercises.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-400">4.5</span>
                <span className="text-gray-400 font-medium">★★★★☆</span>
              </div>
            </div>

            <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-3">
                CBT Therapy
              </h3>
              <p className="text-gray-300 mb-4">
                Professional cognitive behavioral therapy for lasting change.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-400">4.8</span>
                <span className="text-gray-400 font-medium">★★★★★</span>
              </div>
            </div>

            <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-3">
                Exercise Routine
              </h3>
              <p className="text-gray-300 mb-4">
                Regular movement improves mood and reduces stress levels.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-purple-400">4.3</span>
                <span className="text-gray-400 font-medium">★★★★☆</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md hover:bg-purple-700 hover:shadow-xl transition-all">
              Browse Solutions
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all">
              Share What Worked
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FontDemoPage() {
  return (
    <div className={`${geist.variable} ${spaceGrotesk.variable} ${outfit.variable} ${inter.variable} ${plusJakarta.variable}`}>
      <div className="bg-gray-950 py-12 px-8 sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">WWFM Font Comparison</h1>
          <p className="text-gray-400">
            Scroll to compare each font with light and dark backgrounds
          </p>
        </div>
      </div>

      {fonts.map((font) => (
        <FontSection key={font.name} name={font.name} variable={font.variable} />
      ))}
    </div>
  );
}
