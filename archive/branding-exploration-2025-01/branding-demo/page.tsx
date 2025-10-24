export default function BrandingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 bg-black/40 backdrop-blur rounded-3xl p-12 border-2 border-purple-500">
          <h1 className="text-6xl font-black tracking-tight text-white mb-4">
            WWFM Globe Concept Exploration V2
          </h1>
          <p className="text-xl text-purple-300 mb-2">
            10 Bold, Divergent Approaches
          </p>
          <p className="text-lg text-gray-400">
            Making the Globe Integral, Not Tacked On
          </p>
        </div>

        {/* Concept Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

          {/* OPTION 1: Globe AS the O */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-purple-600 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-6">Option 1</p>
              <div className="flex items-center justify-center gap-1 mb-6">
                <span className="text-8xl font-black tracking-tighter text-gray-900">WW</span>
                <div className="relative w-20 h-20 mx-1">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-green-500 shadow-2xl"></div>
                  <div className="absolute inset-0 rounded-full opacity-40 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]"></div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="38" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    <path d="M 2,40 Q 40,25 78,40" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    <path d="M 2,40 Q 40,55 78,40" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    <ellipse cx="40" cy="40" rx="15" ry="38" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                  </svg>
                </div>
                <span className="text-8xl font-black tracking-tighter text-gray-900">M</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-3">Globe Replaces "O"</p>
            </div>
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              <p>✓ <strong>Globe IS the letter</strong></p>
              <p>✓ Earth tones (blue/green/purple)</p>
              <p>✓ Wireframe meridians</p>
              <p>✓ Bold, iconic, memorable</p>
              <p className="text-purple-600 font-semibold mt-4">↑ Most Integral Integration</p>
            </div>
          </div>

          {/* OPTION 2: Neon Wireframe Globe */}
          <div className="bg-black rounded-3xl p-12 shadow-2xl border-4 border-cyan-400 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">Option 2</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-7xl font-black text-white tracking-tight" style={{fontFamily: 'Arial Black, sans-serif', textShadow: '0 0 20px #22d3ee'}}>WWFM</span>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-400 shadow-[0_0_20px_#22d3ee]"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                  <div className="absolute inset-3 rounded-full border-2 border-cyan-400 opacity-60 shadow-[0_0_10px_#22d3ee]"></div>
                </div>
              </div>
              <p className="text-lg font-bold text-cyan-400 mb-3">Cyberpunk Wireframe</p>
            </div>
            <div className="space-y-2 text-sm text-cyan-200 bg-gray-900 p-4 rounded-lg border border-cyan-400/30">
              <p>✓ <strong>Neon glow effects</strong></p>
              <p>✓ Tech-forward cyan accent</p>
              <p>✓ Bold sans-serif (Arial Black)</p>
              <p>✓ Modern, striking, futuristic</p>
              <p className="text-cyan-400 font-semibold mt-4">↑ Maximum Boldness</p>
            </div>
          </div>

          {/* OPTION 3: 3D Glossy Sphere */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-6">Option 3</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-7xl font-black text-white tracking-tight">WWFM</span>
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 via-purple-500 to-pink-600 shadow-2xl"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-transparent via-white/40 to-transparent"></div>
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/60 blur-sm"></div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/30 blur-lg rounded-full"></div>
                </div>
              </div>
              <p className="text-lg font-bold text-purple-200 mb-3">3D Glossy Orb</p>
            </div>
            <div className="space-y-2 text-sm text-purple-100 bg-black/30 p-4 rounded-lg border border-purple-400/30">
              <p>✓ <strong>Realistic 3D depth</strong></p>
              <p>✓ Gradient shimmer effect</p>
              <p>✓ Drop shadow grounding</p>
              <p>✓ Premium, polished feel</p>
              <p className="text-purple-300 font-semibold mt-4">↑ Most Sophisticated</p>
            </div>
          </div>

          {/* OPTION 4: Globe Halo Behind Text */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-orange-500 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-6">Option 4</p>
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 opacity-30 blur-2xl"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[12px] border-orange-500 opacity-20"></div>
                <span className="relative text-8xl font-black text-gray-900 tracking-tight">WWFM</span>
              </div>
              <p className="text-lg font-bold text-orange-600 mb-3">Globe Halo / Aura</p>
            </div>
            <div className="space-y-2 text-sm text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p>✓ <strong>Globe radiates energy</strong></p>
              <p>✓ Warm orange/red palette</p>
              <p>✓ Worldwide reach symbolism</p>
              <p>✓ Text remains primary</p>
              <p className="text-orange-600 font-semibold mt-4">↑ Warmest/Most Inviting</p>
            </div>
          </div>

          {/* OPTION 5: Pixel Matrix Globe */}
          <div className="bg-gray-900 rounded-3xl p-12 shadow-2xl border-4 border-green-400 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-6">Option 5</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-7xl font-black text-white tracking-wider" style={{fontFamily: 'Monaco, monospace'}}>WWFM</span>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0.5 p-1">
                    {[...Array(100)].map((_, i) => {
                      const row = Math.floor(i / 10);
                      const col = i % 10;
                      const centerDist = Math.sqrt(Math.pow(col - 4.5, 2) + Math.pow(row - 4.5, 2));
                      const isVisible = centerDist < 4.5;
                      const isEdge = centerDist > 3 && centerDist < 4.5;
                      return (
                        <div
                          key={i}
                          className={`rounded-sm ${isVisible ? (isEdge ? 'bg-green-400' : 'bg-green-500') : 'bg-transparent'}`}
                          style={{opacity: isVisible ? (isEdge ? 0.6 : 1) : 0}}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold text-green-400 mb-3">Digital Pixel Matrix</p>
            </div>
            <div className="space-y-2 text-sm text-green-200 bg-black/50 p-4 rounded-lg border border-green-400/30">
              <p>✓ <strong>Digital/data aesthetic</strong></p>
              <p>✓ Monospace tech font</p>
              <p>✓ Grid-based globe concept</p>
              <p>✓ Network/connectivity vibe</p>
              <p className="text-green-400 font-semibold mt-4">↑ Most Tech-Forward</p>
            </div>
          </div>

          {/* OPTION 6: Hand-Drawn Sketch Globe */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12 shadow-2xl border-4 border-amber-600 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-6">Option 6</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-7xl font-bold text-amber-900 tracking-normal" style={{fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>WWFM</span>
                <div className="relative w-16 h-16">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#92400e" strokeWidth="2.5"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#92400e" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.3"/>
                    <path d="M 4,32 Q 32,22 60,32 Q 32,42 4,32" fill="none" stroke="#92400e" strokeWidth="2"/>
                    <ellipse cx="32" cy="32" rx="14" ry="28" fill="none" stroke="#92400e" strokeWidth="2"/>
                    <circle cx="32" cy="32" r="3" fill="#92400e"/>
                    <path d="M 20,15 Q 25,12 30,15" fill="none" stroke="#92400e" strokeWidth="1.5" opacity="0.4"/>
                    <path d="M 34,48 Q 40,51 45,48" fill="none" stroke="#92400e" strokeWidth="1.5" opacity="0.4"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-bold text-amber-800 mb-3">Human Sketch</p>
            </div>
            <div className="space-y-2 text-sm text-amber-900 bg-white/60 p-4 rounded-lg border border-amber-300">
              <p>✓ <strong>Hand-drawn warmth</strong></p>
              <p>✓ Approachable serif italic</p>
              <p>✓ Organic, personal touch</p>
              <p>✓ Community-first feeling</p>
              <p className="text-amber-700 font-semibold mt-4">↑ Most Approachable</p>
            </div>
          </div>

          {/* OPTION 7: Neon Sign Glow */}
          <div className="bg-black rounded-3xl p-12 shadow-2xl border-4 border-pink-500 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-6">Option 7</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-7xl font-black text-white tracking-wider" style={{textShadow: '0 0 30px #ec4899, 0 0 60px #ec4899, 0 0 90px #ec4899'}}>WWFM</span>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500" style={{boxShadow: '0 0 30px #ec4899, inset 0 0 30px #ec4899'}}></div>
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-pink-500" style={{boxShadow: '0 0 20px #ec4899'}}></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-pink-500" style={{boxShadow: '0 0 20px #ec4899'}}></div>
                  <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl"></div>
                </div>
              </div>
              <p className="text-lg font-bold text-pink-400 mb-3">Neon Sign Glow</p>
            </div>
            <div className="space-y-2 text-sm text-pink-200 bg-gray-900/80 p-4 rounded-lg border border-pink-500/30">
              <p>✓ <strong>Electric neon effects</strong></p>
              <p>✓ Bold nightlife aesthetic</p>
              <p>✓ Pink stands out dramatically</p>
              <p>✓ Maximum attention-grabbing</p>
              <p className="text-pink-400 font-semibold mt-4">↑ Most Eye-Catching</p>
            </div>
          </div>

          {/* OPTION 8: Vertical Stack + Sun Orb */}
          <div className="bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-700 rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-6">Option 8</p>
              <div className="relative inline-block mb-6">
                <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-2xl"></div>
                <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-yellow-400 opacity-30 animate-ping"></div>
                <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-gradient-to-tl from-transparent via-white/40 to-transparent"></div>
                <div className="text-left space-y-1">
                  <div className="text-6xl font-black text-white leading-none tracking-tighter">WW</div>
                  <div className="text-6xl font-black text-white leading-none tracking-tighter">FM</div>
                </div>
              </div>
              <p className="text-lg font-bold text-teal-100 mb-3">Vertical Stack + Sun</p>
            </div>
            <div className="space-y-2 text-sm text-teal-100 bg-black/30 p-4 rounded-lg border border-teal-400/30">
              <p>✓ <strong>Unique vertical layout</strong></p>
              <p>✓ Glowing sun/planet orb</p>
              <p>✓ Pulse animation (alive)</p>
              <p>✓ Warm, energetic vibe</p>
              <p className="text-teal-300 font-semibold mt-4">↑ Most Unique Layout</p>
            </div>
          </div>

          {/* OPTION 9: Constellation Dots */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-gray-900 hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-6">Option 9</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-8xl font-black text-gray-900 tracking-tighter">WWFM</span>
                <div className="relative w-12 h-12">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-900"></div>
                  <div className="absolute top-1/4 right-0 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  <div className="absolute top-1/4 left-0 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-600 shadow-lg shadow-purple-400"></div>
                  <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  <div className="absolute bottom-1/4 left-0 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-900"></div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
                    <line x1="24" y1="6" x2="24" y2="24" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="24" y1="24" x2="42" y2="12" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="24" y1="24" x2="6" y2="12" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="24" y1="24" x2="42" y2="36" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="24" y1="24" x2="6" y2="36" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                    <line x1="24" y1="24" x2="24" y2="42" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-3">Constellation Network</p>
            </div>
            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p>✓ <strong>Connected network dots</strong></p>
              <p>✓ Abstract globe representation</p>
              <p>✓ Purple center (brand focus)</p>
              <p>✓ Graya-aligned minimal</p>
              <p className="text-purple-600 font-semibold mt-4">↑ Most Graya-Aligned</p>
            </div>
          </div>

          {/* OPTION 10: Hollow Text + Vibrant Globe */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 rounded-3xl p-12 shadow-2xl hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-6">Option 10</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-7xl font-black text-transparent tracking-tight" style={{WebkitTextStroke: '4px white'}}>WWFM</span>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-300 via-blue-500 to-violet-600 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/40 blur-md"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-700/40 to-transparent"></div>
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 80 80">
                    <ellipse cx="40" cy="40" rx="15" ry="35" fill="none" stroke="white" strokeWidth="1"/>
                    <ellipse cx="40" cy="40" rx="25" ry="35" fill="none" stroke="white" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-bold text-purple-100 mb-3">Outlined + Vivid Earth</p>
            </div>
            <div className="space-y-2 text-sm text-purple-100 bg-black/30 p-4 rounded-lg border border-purple-400/40">
              <p>✓ <strong>Hollow outlined type</strong></p>
              <p>✓ Vibrant earth-tone globe</p>
              <p>✓ High contrast statement</p>
              <p>✓ Premium bold aesthetic</p>
              <p className="text-purple-300 font-semibold mt-4">↑ Most Premium</p>
            </div>
          </div>

        </div>

        {/* Comparison Section */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-12 border-2 border-white/20 mb-12">
          <h2 className="text-4xl font-black tracking-tight text-white mb-4 text-center">
            Quick Visual Comparison
          </h2>
          <p className="text-center text-gray-300 mb-8">All 10 options side-by-side at header size</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {/* Option 1 */}
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-2">
                <span className="text-3xl font-black text-gray-900">WW</span>
                <div className="relative w-7 h-7">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-green-500"></div>
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="13" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                  </svg>
                </div>
                <span className="text-3xl font-black text-gray-900">M</span>
              </div>
              <p className="text-xs text-gray-600">1: O-Globe</p>
            </div>

            {/* Option 2 */}
            <div className="bg-black rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-black text-white">WWFM</span>
                <div className="w-5 h-5 rounded-full border-2 border-cyan-400"></div>
              </div>
              <p className="text-xs text-cyan-400">2: Neon</p>
            </div>

            {/* Option 3 */}
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-black text-white">WWFM</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-pink-600"></div>
              </div>
              <p className="text-xs text-purple-200">3: 3D Orb</p>
            </div>

            {/* Option 4 */}
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="relative inline-block">
                <div className="absolute -inset-4 rounded-full bg-orange-400 opacity-20 blur-xl"></div>
                <span className="relative text-3xl font-black text-gray-900">WWFM</span>
              </div>
              <p className="text-xs text-orange-600 mt-2">4: Halo</p>
            </div>

            {/* Option 5 */}
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-black text-white" style={{fontFamily: 'monospace'}}>WWFM</span>
                <div className="w-5 h-5 grid grid-cols-5 grid-rows-5 gap-px">
                  {[...Array(25)].map((_, i) => {
                    const isEdge = [0,4,5,9,10,14,15,19,20,24].includes(i);
                    return <div key={i} className={isEdge ? 'bg-green-400' : 'bg-green-500'} />;
                  })}
                </div>
              </div>
              <p className="text-xs text-green-400">5: Pixel</p>
            </div>

            {/* Option 6 */}
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-bold text-amber-900" style={{fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>WWFM</span>
                <svg className="w-5 h-5" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#92400e" strokeWidth="1.5"/>
                  <ellipse cx="10" cy="10" rx="4" ry="8" fill="none" stroke="#92400e" strokeWidth="1"/>
                </svg>
              </div>
              <p className="text-xs text-amber-700">6: Sketch</p>
            </div>

            {/* Option 7 */}
            <div className="bg-black rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-black text-white" style={{textShadow: '0 0 15px #ec4899'}}>WWFM</span>
                <div className="w-5 h-5 rounded-full border-2 border-pink-500" style={{boxShadow: '0 0 15px #ec4899'}}></div>
              </div>
              <p className="text-xs text-pink-400">7: Neon</p>
            </div>

            {/* Option 8 */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl p-4 text-center">
              <div className="relative inline-block">
                <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                <div className="text-left">
                  <div className="text-xl font-black text-white leading-tight">WW</div>
                  <div className="text-xl font-black text-white leading-tight">FM</div>
                </div>
              </div>
              <p className="text-xs text-teal-200 mt-2">8: Stack</p>
            </div>

            {/* Option 9 */}
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-3xl font-black text-gray-900">WWFM</span>
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-gray-900"></div>
                  <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-gray-900"></div>
                </div>
              </div>
              <p className="text-xs text-gray-600">9: Dots</p>
            </div>

            {/* Option 10 */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-2xl font-black text-transparent" style={{WebkitTextStroke: '2px white'}}>WWFM</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-300 via-blue-500 to-violet-600"></div>
              </div>
              <p className="text-xs text-purple-200">10: Hollow</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-8 py-4 bg-white text-purple-900 font-black text-lg rounded-full hover:bg-purple-100 transition-colors shadow-2xl"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
