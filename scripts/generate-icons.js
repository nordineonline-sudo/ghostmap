const sharp = require('sharp');

// Clean vector-style ghost riding a bicycle — simple, minimal, transparent bg
function createSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <!-- Back wheel -->
  <circle cx="145" cy="370" r="75" fill="none" stroke="#94A3B8" stroke-width="12"/>
  <circle cx="145" cy="370" r="8" fill="#94A3B8"/>

  <!-- Front wheel -->
  <circle cx="375" cy="370" r="75" fill="none" stroke="#94A3B8" stroke-width="12"/>
  <circle cx="375" cy="370" r="8" fill="#94A3B8"/>

  <!-- Bike frame -->
  <line x1="145" y1="370" x2="260" y2="280" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>
  <line x1="260" y1="280" x2="375" y2="370" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>
  <line x1="260" y1="280" x2="260" y2="340" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>
  <line x1="145" y1="370" x2="260" y2="340" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>

  <!-- Seat -->
  <line x1="245" y1="272" x2="278" y2="272" stroke="#475569" stroke-width="12" stroke-linecap="round"/>

  <!-- Handlebar -->
  <line x1="350" y1="260" x2="390" y2="280" stroke="#475569" stroke-width="10" stroke-linecap="round"/>
  <line x1="375" y1="370" x2="370" y2="270" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>

  <!-- Ghost body -->
  <path d="M200 260 C200 160, 320 160, 320 260 L320 300 
           C310 285, 300 300, 290 285 
           C280 300, 270 285, 260 300 
           C250 285, 240 300, 230 285 
           C220 300, 210 285, 200 300 Z" 
        fill="#E0E7FF" opacity="0.92"/>

  <!-- Ghost eyes -->
  <ellipse cx="240" cy="215" rx="15" ry="18" fill="white"/>
  <ellipse cx="283" cy="215" rx="15" ry="18" fill="white"/>
  <circle cx="244" cy="218" r="8" fill="#3B82F6"/>
  <circle cx="287" cy="218" r="8" fill="#3B82F6"/>

  <!-- Ghost eye shine -->
  <circle cx="241" cy="213" r="3" fill="white"/>
  <circle cx="284" cy="213" r="3" fill="white"/>

  <!-- Small smile -->
  <path d="M250 242 Q262 255, 274 242" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>

  <!-- Ghost arms holding handlebar -->
  <path d="M310 250 Q330 245, 355 262" fill="none" stroke="#E0E7FF" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
  <path d="M205 255 Q185 270, 195 290" fill="none" stroke="#E0E7FF" stroke-width="10" stroke-linecap="round" opacity="0.9"/>

  <!-- Speed lines -->
  <line x1="50" y1="220" x2="120" y2="220" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
  <line x1="30" y1="250" x2="110" y2="250" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
  <line x1="55" y1="280" x2="105" y2="280" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
</svg>`;
}

async function generate() {
  const svg = createSVG(1024);
  const svgBuffer = Buffer.from(svg);

  await sharp(svgBuffer).resize(1024, 1024).png().toFile('assets/icon.png');
  console.log('✓ icon.png (1024x1024)');

  await sharp(svgBuffer).resize(1024, 1024).png().toFile('assets/adaptive-icon.png');
  console.log('✓ adaptive-icon.png (1024x1024)');

  await sharp(svgBuffer).resize(48, 48).png().toFile('assets/favicon.png');
  console.log('✓ favicon.png (48x48)');

  await sharp(svgBuffer).resize(512, 512).png().toFile('assets/splash-icon.png');
  console.log('✓ splash-icon.png (512x512)');

  console.log('\nDone!');
}

generate().catch(console.error);
