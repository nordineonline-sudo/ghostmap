const sharp = require('sharp');

const palette = {
  sky: '#35C8FF',
  skyLight: '#B9F0FF',
  cream: '#F7FCFF',
  navy: '#17324D',
  teal: '#118AB2',
  coral: '#FF8A5B',
  route: '#6BE18A',
  shadow: '#1282A2',
};

function createBadgeSVG({ size, withBackground, transparentBackground, compact = false }) {
  const background = transparentBackground
    ? ''
    : `<rect x="0" y="0" width="512" height="512" rx="${withBackground ? 118 : 0}" fill="url(#bg)"/>`;

  const halo = withBackground
    ? `<circle cx="368" cy="134" r="86" fill="${palette.skyLight}" opacity="0.42"/>`
    : '<circle cx="372" cy="138" r="82" fill="#D8F7FF" opacity="0.55"/>';

  const lift = compact ? 18 : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="64" y1="40" x2="446" y2="468" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${palette.sky}"/>
      <stop offset="1" stop-color="${palette.teal}"/>
    </linearGradient>
    <filter id="shadow" x="0" y="0" width="512" height="512" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="${palette.shadow}" flood-opacity="0.22"/>
    </filter>
  </defs>

  ${background}
  ${halo}
  <g transform="translate(0 ${lift})" filter="url(#shadow)">
    <path d="M256 92c75.7 0 137 61.3 137 137 0 83.7-82.8 145.7-122.7 175.4-8.8 6.6-19.8 6.6-28.6 0C201.8 374.7 119 312.7 119 229c0-75.7 61.3-137 137-137Z" fill="${palette.cream}"/>
    <path d="M191 275c34 10.7 95.9 10.7 130 0" fill="none" stroke="${palette.route}" stroke-width="20" stroke-linecap="round"/>
    <path d="M180 213c0-49.7 34.8-86 76-86s76 36.3 76 86v54.5c0 3.4-1.5 6.6-4.1 8.8-9.9 8.4-18.6 3.3-26.3-1.2-7.9-4.6-14.7-8.6-21.6 0-6.8 8.5-13.3 3.9-20.1-.9-7.3-5.1-15.6 9.5-24.4 8.6-5.8-.6-9.8-3.9-13.7-7.1-6.4-5.3-12.4-10.2-23.7 1.5-5.6 5.8-18.1 2.2-18.1-9.7V213Z" fill="${palette.cream}"/>
    <circle cx="225" cy="211" r="18" fill="${palette.navy}"/>
    <circle cx="287" cy="211" r="18" fill="${palette.navy}"/>
    <circle cx="219" cy="204" r="5" fill="white"/>
    <circle cx="281" cy="204" r="5" fill="white"/>
    <path d="M226 250c11.3 12.6 48.7 12.6 60 0" fill="none" stroke="${palette.navy}" stroke-width="12" stroke-linecap="round"/>
    <path d="M165 311c22.8-16.3 42.4-24.4 58.8-24.4 13.9 0 26.7 5.2 38.6 15.6 16.3 14.2 29.4 21.3 39.1 21.3 15.8 0 32.6-11.8 50.5-35.3" fill="none" stroke="${palette.coral}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="351" cy="286" r="22" fill="${palette.coral}"/>
  </g>
  </svg>`;
}

async function writePng(svg, outputPath, width, height) {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(outputPath);
  console.log(`✓ ${outputPath} (${width}x${height})`);
}

async function generate() {
  await writePng(
    createBadgeSVG({ size: 1024, withBackground: true, transparentBackground: false }),
    'assets/icon.png',
    1024,
    1024,
  );

  await writePng(
    createBadgeSVG({ size: 1024, withBackground: false, transparentBackground: true }),
    'assets/adaptive-icon.png',
    1024,
    1024,
  );

  await writePng(
    createBadgeSVG({ size: 48, withBackground: true, transparentBackground: false, compact: true }),
    'assets/favicon.png',
    48,
    48,
  );

  await writePng(
    createBadgeSVG({ size: 512, withBackground: false, transparentBackground: true, compact: true }),
    'assets/splash-icon.png',
    512,
    512,
  );

  console.log('\nDone!');
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
