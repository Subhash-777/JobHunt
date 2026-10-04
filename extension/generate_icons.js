#!/usr/bin/env node
/**
 * Generate simple colored PNG icons for the Chrome extension.
 * Run once with: node generate_icons.js
 * Requires: npm install canvas (only needed once)
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const outDir = path.join(__dirname, 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = '#0f0f1a';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Orange gradient circle
  const gradient = ctx.createRadialGradient(size * 0.4, size * 0.3, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, '#FF8C42');
  gradient.addColorStop(1, '#FF6B35');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Text "JH"
  if (size >= 48) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.32}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JH', size / 2, size / 2 + size * 0.02);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
}

console.log('Done! Icons saved to extension/icons/');
