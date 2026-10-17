const STARS = [
  { x: 52, y: 60, s: 1, d: '0s' },
  { x: 120, y: 28, s: 0.6, d: '1.2s' },
  { x: 350, y: 70, s: 0.8, d: '0.6s' },
  { x: 368, y: 190, s: 0.5, d: '2s' },
  { x: 34, y: 180, s: 0.5, d: '1.6s' },
  { x: 230, y: 36, s: 0.45, d: '0.9s' },
];

const FUR = '#f5f5f4';
const FUR_SHADE = '#d6d3d1';
const FUR_DARK = '#78716c';

// İletişim bölümündeki dekoratif sahne: hilal ayın içinde uyuyan kedi.
// Üzerine gelince uyanır; kuyruk sallanır, ay süzülür, z harfleri yükselir.
export default function ContactCat() {
  return (
    <svg
      viewBox="0 0 400 350"
      className="contact-cat h-auto w-full max-w-[460px]"
      role="img"
      aria-label="Hilal ayın içinde kıvrılıp uyuyan beyaz bir kedi çizimi"
    >
      <style>{`
        .contact-cat .cat-scene { animation: cat-bob 6s ease-in-out infinite; }
        .contact-cat .cat-tail { transform-box: view-box; transform-origin: 144px 226px; animation: cat-tail 3.6s ease-in-out infinite; }
        .contact-cat .cat-breath { transform-box: view-box; transform-origin: 200px 240px; animation: cat-breath 3.2s ease-in-out infinite; }
        .contact-cat .cat-z { opacity: 0; animation: cat-z 3.6s ease-out infinite; }
        .contact-cat .cat-star { animation: cat-twinkle 2.8s ease-in-out infinite; }
        .contact-cat .cat-eye-open { opacity: 0; transition: opacity 0.25s; }
        .contact-cat .cat-eye-closed, .contact-cat .cat-zs { transition: opacity 0.25s; }
        .contact-cat:hover .cat-eye-open { opacity: 1; }
        .contact-cat:hover .cat-eye-closed, .contact-cat:hover .cat-zs { opacity: 0; }
        @keyframes cat-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes cat-tail { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(9deg); } }
        @keyframes cat-breath { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.035); } }
        @keyframes cat-z { 0% { opacity: 0; transform: translate(0, 0); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(14px, -26px); } }
        @keyframes cat-twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .contact-cat .cat-scene, .contact-cat .cat-tail, .contact-cat .cat-breath, .contact-cat .cat-star { animation: none; }
          .contact-cat .cat-z { animation: none; opacity: 0.8; }
        }
      `}</style>

      <defs>
        <radialGradient id="cat-moon-glow" cx="0.5" cy="0.62" r="0.5">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cat-moon-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        {/* Büyük daireden üstteki daire çıkarılınca çanak biçimli hilal kalır */}
        <mask id="cat-moon-cut">
          <rect width="400" height="350" fill="white" />
          <circle cx="200" cy="112" r="125" fill="black" />
        </mask>
      </defs>

      {STARS.map((star) => (
        <path
          key={`${star.x}-${star.y}`}
          className="cat-star"
          style={{ animationDelay: star.d }}
          transform={`translate(${star.x} ${star.y}) scale(${star.s})`}
          d="M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9 Z"
          fill="white"
        />
      ))}

      <g className="cat-scene">
        <circle cx="200" cy="215" r="125" fill="url(#cat-moon-glow)" />

        {/* Hilal ay ve kraterler */}
        <circle cx="200" cy="162" r="130" fill="url(#cat-moon-fill)" mask="url(#cat-moon-cut)" />
        <g fill="#f59e0b" opacity="0.35">
          <circle cx="150" cy="262" r="8" />
          <circle cx="232" cy="270" r="6" />
          <circle cx="104" cy="226" r="5" />
          <circle cx="292" cy="234" r="4" />
          <circle cx="190" cy="282" r="3.5" />
        </g>

        {/* Kuyruk: ayın önünden aşağı sarkar */}
        <path
          className="cat-tail"
          d="M146 224 C122 234 116 262 128 284 C138 302 134 320 118 328"
          fill="none"
          stroke={FUR}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          className="cat-tail"
          d="M146 224 C122 234 116 262 128 284 C138 302 134 320 118 328"
          pathLength={100}
          strokeDasharray="16 100"
          strokeDashoffset={-84}
          fill="none"
          stroke={FUR_DARK}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Gövde: çanağın iç kavsine oturan somun */}
        <g className="cat-breath">
          <path d="M140 224 C136 200 166 186 204 186 C236 186 256 196 262 210 L262 222 Q200 252 140 224 Z" fill={FUR} />
          <circle cx="164" cy="214" r="20" fill={FUR_SHADE} />
          <g fill="none" stroke={FUR_SHADE} strokeWidth="5" strokeLinecap="round">
            <path d="M188 189 Q192 199 190 207" />
            <path d="M207 187 Q211 197 209 205" />
            <path d="M226 189 Q230 198 228 206" />
          </g>
        </g>

        {/* Ön patiler ve baş */}
        <ellipse cx="288" cy="224" rx="17" ry="6.5" fill={FUR} />
        <path d="M252 188 L256 160 L272 178 Z" fill={FUR_SHADE} />
        <path d="M268 176 L286 156 L292 184 Z" fill={FUR} />
        <path d="M274 176 L285 163 L288 180 Z" fill="#fda4af" />
        <circle cx="272" cy="200" r="25" fill={FUR} />
        <path d="M290 196 C298 198 302 204 298 210 C294 214 288 214 284 212 Z" fill={FUR} />

        {/* Yüz: uyurken kapalı göz, üzerine gelince açık göz */}
        <path className="cat-eye-closed" d="M274 200 Q281 206 288 200" fill="none" stroke={FUR_DARK} strokeWidth="2.2" strokeLinecap="round" />
        <g className="cat-eye-open">
          <path d="M274 199 Q281 191 289 199 Q281 206 274 199 Z" fill="#bef264" />
          <ellipse cx="282" cy="199" rx="1.8" ry="4" fill="#0c0a09" />
        </g>
        <path d="M297 203 L302 205 L298 209 Z" fill="#f472b6" />
        <path d="M296 211 Q292 215 288 213" fill="none" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="276" cy="210" r="4" fill="#fda4af" opacity="0.5" />
        <g stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.7">
          <path d="M292 208 L322 202" />
          <path d="M292 212 L324 214" />
        </g>

        {/* Uyku harfleri */}
        <g className="cat-zs" fill="#93b4f8" fontFamily="var(--font-geist-mono), monospace" fontWeight="600">
          <text className="cat-z" x="296" y="166" fontSize="14">z</text>
          <text className="cat-z" x="310" y="148" fontSize="18" style={{ animationDelay: '1.2s' }}>z</text>
          <text className="cat-z" x="326" y="126" fontSize="22" style={{ animationDelay: '2.4s' }}>z</text>
        </g>
      </g>
    </svg>
  );
}
