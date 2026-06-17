'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Orbitron } from 'next/font/google';
import CircularGallery from './ui/CircularGallery';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

// ── Canvas 2D Drawing Helpers ────────────────────────────────────────────────

const CARD_W = 320;
const CARD_H = 400;
const SCALE = 2;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawModuleCard(
  ctx: CanvasRenderingContext2D,
  idx: number
): string {
  const scale = SCALE;
  const W = CARD_W;
  const H = CARD_H;
  // Clear entire canvas before drawing each card (shared canvas reused)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  const mod = MODULES[idx];

  // Card background
  roundRect(ctx, 0, 0, W, H, 16);
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, 'rgba(23,23,23,1)');
  bgGrad.addColorStop(1, 'rgba(10,10,10,1)');
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Gradient overlay
  const overlayGrad = ctx.createLinearGradient(0, 0, W, H);
  overlayGrad.addColorStop(0, mod.colorStart);
  overlayGrad.addColorStop(1, mod.colorEnd);
  ctx.globalAlpha = 0.3;
  roundRect(ctx, 0, 0, W, H, 16);
  ctx.fillStyle = overlayGrad;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Glow circle top-right
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(W - 14, 14, W * 0.175, 0, Math.PI * 2);
  if (mod.colorStart) ctx.fillStyle = mod.colorStart;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Icon container
  roundRect(ctx, 24, 24, 48, 48, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.stroke();

  // Icon (draw as SVG-like shapes for each module)
  drawIcon(ctx, idx, 48, 48);

  // Badge
  const badgeW = ctx.measureText(mod.badge.toUpperCase()).width + 20;
  roundRect(ctx, W - 24 - badgeW, 30, badgeW, 24, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(212,212,212,1)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(mod.badge.toUpperCase(), W - 24 - badgeW / 2, 46);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(mod.title, 24, 104);

  // Description (word wrap)
  ctx.fillStyle = 'rgba(212,212,212,1)';
  ctx.font = '13px sans-serif';
  wrapText(ctx, mod.desc, 24, 124, W - 48, 18);

  // Visual area
  ctx.save();
  mod.drawVisual(ctx, 24, 170, W - 48, H - 194);
  ctx.restore();

  ctx.restore();

  const canvas = ctx.canvas;
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = W * scale;
  fullCanvas.height = H * scale;
  const fullCtx = fullCanvas.getContext('2d')!;
  fullCtx.drawImage(canvas, 0, 0);
  return fullCanvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  idx: number,
  cx: number,
  cy: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = iconColors[idx];
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (idx) {
    case 0: // Layers
      ctx.strokeRect(-8, -2, 16, 6);
      ctx.strokeRect(-10, -8, 16, 6);
      ctx.strokeRect(-6, 4, 16, 4);
      break;
    case 1: // MessageSquare
      roundRect(ctx, -10, -9, 20, 14, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 5);
      ctx.lineTo(-6, 9);
      ctx.lineTo(2, 5);
      ctx.stroke();
      break;
    case 2: // LineChart
      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.lineTo(-10, -6);
      ctx.lineTo(10, -6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-4, -5);
      ctx.lineTo(2, -3);
      ctx.lineTo(8, -8);
      ctx.stroke();
      break;
    case 3: // FileText
      roundRect(ctx, -8, -10, 16, 20, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(6, -5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.lineTo(6, -1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 3);
      ctx.lineTo(2, 3);
      ctx.stroke();
      break;
    case 4: // Image
      roundRect(ctx, -10, -10, 20, 20, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-3, -3, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(-4, -1);
      ctx.lineTo(4, 6);
      ctx.lineTo(10, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, -4, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = iconColors[idx];
      ctx.fill();
      break;
    case 5: // CheckSquare
      roundRect(ctx, -9, -10, 18, 18, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-1, 3);
      ctx.lineTo(5, -4);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

const iconColors = [
  '#60a5fa', // blue-400
  '#c084fc', // purple-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#22d3ee', // cyan-400
  '#fb7185', // rose-400
];

// ── Module Visual Drawing Functions ──────────────────────────────────────────

function drawPortfolioVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const innerW = w;
  // Container
  roundRect(ctx, x, y, innerW, h, 19);
  ctx.fillStyle = 'rgba(23,23,23,0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(96,165,250,0.1)';
  ctx.stroke();

  let cy = y + 16;

  // Profile row
  roundRect(ctx, x + 10, cy, 10, 10, 3); // avatar placeholder
  ctx.fillStyle = '#3b82f6';
  ctx.fill();

  // Name + title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Mehmet Kerem', x + 26, cy + 6);
  ctx.fillStyle = '#60a5fa';
  ctx.font = '8px monospace';
  ctx.fillText('FULL-STACK DEVELOPER', x + 26, cy + 14);

  // Active badge
  const badgeX = x + innerW - 56;
  roundRect(ctx, badgeX, cy, 46, 16, 8);
  ctx.fillStyle = 'rgba(52,211,153,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(52,211,153,0.2)';
  ctx.stroke();
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('AKTİF', badgeX + 8, cy + 11);

  // Separator
  cy += 26;
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.moveTo(x + 10, cy);
  ctx.lineTo(x + innerW - 10, cy);
  ctx.stroke();
  cy += 10;

  // Stats grid (3 columns)
  const statW = (innerW - 40) / 3;
  const stats = [
    { label: 'Projeler', value: '18+' },
    { label: 'Skor', value: '%100' },
    { label: 'Deneyim', value: '5y+' },
  ];
  for (let i = 0; i < 3; i++) {
    const sx = x + 10 + i * (statW + 4);
    roundRect(ctx, sx, cy, statW, 40, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.stroke();
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stats[i].label, sx + statW / 2, cy + 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(stats[i].value, sx + statW / 2, cy + 32);
  }
  cy += 54;

  // Tags
  const tags = ['Next.js 16', 'React 19', 'WebGL', 'GSAP'];
  let tagX = x + 10;
  for (const tag of tags) {
    const tw = ctx.measureText(tag).width + 16;
    if (tagX + tw > x + innerW - 10) break;
    roundRect(ctx, tagX, cy, tw, 20, 6);
    ctx.fillStyle = 'rgba(96,165,250,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(96,165,250,0.2)';
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tag, tagX + tw / 2, cy + 13);
    tagX += tw + 6;
  }
}

function drawAIVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 19);
  ctx.fillStyle = 'rgba(23,23,23,0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(192,132,252,0.1)';
  ctx.stroke();

  let cy = y + 12;

  // User bubble (right)
  const userText = 'Projelerimi analiz et.';
  ctx.font = '10px monospace';
  const userW = ctx.measureText(userText).width + 20;
  const userX = x + w - userW - 8;
  roundRect(ctx, userX, cy, userW, 22, 10);
  ctx.fillStyle = 'rgba(38,38,38,1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.stroke();
  ctx.fillStyle = '#e5e5e5';
  ctx.textAlign = 'left';
  ctx.fillText(userText, userX + 10, cy + 15);
  cy += 30;

  // Bot bubble (left)
  const botText = 'Notlar ve portfolyo tarandı.';
  ctx.font = '10px monospace';
  const botW = ctx.measureText(botText).width + 20;
  ctx.fillStyle = '#c084fc';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🤖', x + 16, cy + 7);
  roundRect(ctx, x + 28, cy - 4, Math.min(botW, w - 60), 22, 10);
  ctx.fillStyle = 'rgba(88,28,135,0.3)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(192,132,252,0.2)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(233,213,255,0.9)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(botText, x + 38, cy + 11);
  cy += 30;

  // Voice waveform + TTS indicator
  roundRect(ctx, x + 8, cy, w - 16, 32, 11);
  ctx.fillStyle = 'rgba(88,28,135,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(192,132,252,0.12)';
  ctx.stroke();

  // Wave bars
  const barW = 4;
  const barGap = 3;
  const barCount = 9;
  const barsH = [8, 14, 18, 6, 10, 16, 8, 12, 6];
  const startBX = x + 16;
  for (let i = 0; i < barCount; i++) {
    const bh = barsH[i] || 8;
    const bx = startBX + i * (barW + barGap);
    const by = cy + 16 - bh / 2;
    const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    barGrad.addColorStop(0, '#c084fc');
    barGrad.addColorStop(1, '#f472b6');
    ctx.fillStyle = barGrad;
    roundRect(ctx, bx, by, barW, bh, 2);
    ctx.fill();
  }

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('TTS AKTİF', x + w - 16, cy + 21);
}

function drawFinanceVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 19);
  ctx.fillStyle = 'rgba(23,23,23,0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(52,211,153,0.1)';
  ctx.stroke();

  // Balance
  ctx.fillStyle = '#a3a3a3';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('NET BAKİYE', x + 14, y + 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('₺134,850.00', x + 14, y + 56);

  // Trending badge
  const trendX = x + w - 70;
  roundRect(ctx, trendX, y + 24, 56, 20, 6);
  ctx.fillStyle = 'rgba(52,211,153,0.15)';
  ctx.fill();
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('+%14.2', trendX + 28, y + 38);
  ctx.fillStyle = '#a3a3a3';
  ctx.font = '8px monospace';
  ctx.fillText('Son 30 Gün', trendX + 28, y + 52);

  // Chart
  const chartX = x + 10;
  const chartY = y + 68;
  const chartW = w - 20;
  const chartH = h - 84;

  roundRect(ctx, chartX, chartY, chartW, chartH, 8);
  ctx.fillStyle = 'rgba(10,10,10,0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.stroke();

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    const gy = chartY + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chartX + 4, gy);
    ctx.lineTo(chartX + chartW - 4, gy);
    ctx.stroke();
  }

  // Gradient area
  const points = [
    [0, 32], [25, 18], [40, 25], [60, 15], [80, 8], [100, 2],
  ];
  ctx.beginPath();
  ctx.moveTo(chartX + 4, chartY + chartH - 4);
  for (let i = 0; i < points.length; i++) {
    const px = chartX + 4 + (points[i][0] / 100) * (chartW - 8);
    const py = chartY + 4 + (points[i][1] / 43) * (chartH - 8);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(chartX + chartW - 4, chartY + chartH - 4);
  ctx.closePath();
  const areaGrad = ctx.createLinearGradient(chartX, chartY, chartX, chartY + chartH);
  areaGrad.addColorStop(0, 'rgba(16,185,129,0.25)');
  areaGrad.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = chartX + 4 + (points[i][0] / 100) * (chartW - 8);
    const py = chartY + 4 + (points[i][1] / 43) * (chartH - 8);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Tooltip dot + badge
  const tpX = chartX + 4 + (80 / 100) * (chartW - 8);
  const tpY = chartY + 4 + (8 / 43) * (chartH - 8);
  ctx.beginPath();
  ctx.arc(tpX, tpY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  roundRect(ctx, tpX - 22, tpY - 22, 44, 16, 4);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('₺24,500', tpX, tpY - 11);
}

function drawMarkdownVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const halfW = (w - 8) / 2;

  // Left pane (Editor)
  roundRect(ctx, x, y, halfW, h, 12);
  ctx.fillStyle = 'rgba(10,10,10,0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.stroke();

  ctx.fillStyle = '#a3a3a3';
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('EDİTÖR', x + 8, y + 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 20);
  ctx.lineTo(x + halfW - 6, y + 20);
  ctx.stroke();

  const editorLines = [
    { text: '# Mehmet Kerem', color: '#f59e0b' },
    { text: '---', color: '#525252' },
    { text: '> Fullstack Dev', color: '#f59e0b' },
    { text: '- React 19', color: '#f59e0b' },
    { text: '- WebGL & GSAP', color: '#f59e0b' },
  ];
  ctx.font = '8px monospace';
  for (let i = 0; i < editorLines.length; i++) {
    ctx.fillStyle = editorLines[i].color;
    ctx.fillText(editorLines[i].text, x + 8, y + 32 + i * 14);
  }

  // Right pane (Preview)
  const rx = x + halfW + 8;
  roundRect(ctx, rx, y, halfW, h, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(251,191,36,0.12)';
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = '7px monospace';
  ctx.fillText('ÖNİZLEME', rx + 8, y + 14);
  ctx.strokeStyle = 'rgba(251,191,36,0.08)';
  ctx.beginPath();
  ctx.moveTo(rx + 6, y + 20);
  ctx.lineTo(rx + halfW - 6, y + 20);
  ctx.stroke();

  ctx.fillStyle = '#52b950';
  ctx.font = 'bold 6px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('CANLI', rx + halfW - 8, y + 14);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Mehmet Kerem', rx + 8, y + 34);

  ctx.fillStyle = 'rgba(212,212,212,0.8)';
  ctx.font = 'italic 7px sans-serif';
  ctx.fillStyle = 'rgba(251,191,36,0.5)';
  ctx.fillRect(rx + 8, y + 42, 2, 18);
  ctx.fillStyle = 'rgba(212,212,212,0.7)';
  ctx.fillText('Fullstack Dev', rx + 14, y + 48);

  ctx.fillStyle = 'rgba(163,163,163,1)';
  ctx.font = '7px sans-serif';
  ctx.fillText('• React 19', rx + 12, y + 64);
  ctx.fillText('• WebGL & GSAP', rx + 12, y + 76);
}

function drawWebPVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 19);
  ctx.fillStyle = 'rgba(23,23,23,0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.1)';
  ctx.stroke();

  // Upload area with dashed border
  roundRect(ctx, x + 10, y + 10, w - 20, h / 2 - 10, 12);
  ctx.fillStyle = 'rgba(8,145,178,0.08)';
  ctx.fill();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(34,211,238,0.3)';
  ctx.stroke();
  ctx.setLineDash([]);

  // File card (left)
  const fileX = x + 20;
  const fileY = y + 24;
  roundRect(ctx, fileX, fileY, 36, 36, 8);
  ctx.fillStyle = 'rgba(38,38,38,1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.stroke();
  ctx.fillStyle = '#a3a3a3';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PNG', fileX + 18, fileY + 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('2.4MB', fileX + 18, fileY + 28);

  // File name + progress
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('avatar.png', x + 64, y + 34);
  roundRect(ctx, x + 64, y + 42, 64, 6, 3);
  ctx.fillStyle = 'rgba(38,38,38,1)';
  ctx.fill();
  roundRect(ctx, x + 64, y + 42, 64 * 0.84, 6, 3);
  ctx.fillStyle = '#22d3ee';
  ctx.fill();
  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('84%', x + w - 20, y + 48);

  // Output card (right)
  const outX = x + w - 56;
  roundRect(ctx, outX, fileY, 36, 36, 8);
  ctx.fillStyle = 'rgba(8,145,178,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.25)';
  ctx.stroke();
  ctx.fillStyle = '#67e8f9';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WEBP', outX + 18, fileY + 18);
  ctx.fillText('380KB', outX + 18, fileY + 28);

  // Efficiency badge
  roundRect(ctx, x + 10, y + h / 2 + 4, w - 20, 24, 8);
  ctx.fillStyle = 'rgba(34,211,238,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.18)';
  ctx.stroke();
  ctx.fillStyle = '#e5e5e5';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Gizlilik: %100 Yerel İşlem', x + 20, y + h / 2 + 20);
  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('-%84 Boyut', x + w - 20, y + h / 2 + 20);
}

function drawProductivityVisual(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const halfW = (w - 8) / 2;

  // Left pane (Tasks)
  roundRect(ctx, x, y, halfW, h, 12);
  ctx.fillStyle = 'rgba(10,10,10,0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.stroke();

  ctx.fillStyle = '#a3a3a3';
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GÖREVLER', x + 8, y + 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 20);
  ctx.lineTo(x + halfW - 6, y + 20);
  ctx.stroke();

  // Done tasks
  const tasks = [
    { text: 'CardSwap Refactor', done: true },
    { text: 'WebP Converter', done: true },
    { text: 'Yayınla', done: false },
  ];
  for (let i = 0; i < tasks.length; i++) {
    const ty = y + 32 + i * 18;
    const t = tasks[i];
    roundRect(ctx, x + 8, ty, 12, 12, 4);
    if (t.done) {
      ctx.fillStyle = 'rgba(251,113,133,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251,113,133,0.25)';
      ctx.stroke();
      ctx.fillStyle = '#fb7185';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓', x + 14, ty + 10);
      ctx.fillStyle = 'rgba(115,115,115,1)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(t.text, x + 26, ty + 10);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(229,229,229,1)';
      ctx.textAlign = 'left';
      ctx.fillText(t.text, x + 26, ty + 10);
    }
  }

  // Right pane (Calendar)
  const rx = x + halfW + 8;
  roundRect(ctx, rx, y, halfW, h, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(251,113,133,0.12)';
  ctx.stroke();

  ctx.fillStyle = '#fb7185';
  ctx.font = '7px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('AJANDA', rx + 8, y + 14);
  ctx.strokeStyle = 'rgba(251,113,133,0.08)';
  ctx.beginPath();
  ctx.moveTo(rx + 6, y + 20);
  ctx.lineTo(rx + halfW - 6, y + 20);
  ctx.stroke();

  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu'];
  const dayW = (halfW - 12) / 5;
  for (let i = 0; i < days.length; i++) {
    const dx = rx + 6 + i * dayW;
    const dy = y + 26;
    if (i === 0) {
      roundRect(ctx, dx, dy, dayW - 1, 30, 6);
      ctx.fillStyle = 'rgba(251,113,133,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251,113,133,0.25)';
      ctx.stroke();
      ctx.fillStyle = '#fda4af';
    } else {
      ctx.fillStyle = '#525252';
    }
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(days[i], dx + dayW / 2 - 0.5, dy + 14);
    ctx.font = '9px monospace';
    ctx.fillText(String(i + 1), dx + dayW / 2 - 0.5, dy + 26);
  }
}

// ── Module Definitions ───────────────────────────────────────────────────────

const MODULES: {
  icon: string;
  title: string;
  desc: string;
  colorStart: string;
  colorEnd: string;
  badge: string;
  drawVisual: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
}[] = [
  {
    icon: 'Layers',
    title: 'Kişisel Portfolyo',
    desc: 'Yaptığım projeleri, tasarım çalışmalarımı ve yazılım tecrübelerimi modern bir arayüzle sergilediğim kişisel showcase alanı.',
    colorStart: 'rgba(59,130,246,0.2)',
    colorEnd: 'rgba(99,102,241,0.05)',
    badge: 'Portfolyo',
    drawVisual: drawPortfolioVisual,
  },
  {
    icon: 'MessageSquare',
    title: 'AI Kişisel Asistan',
    desc: 'Sesli yanıt (TTS/STT) özellikli, tüm veritabanı notlarımı ve projelerimi analiz edebilen entegre yapay zeka sohbet modülü.',
    colorStart: 'rgba(168,85,247,0.2)',
    colorEnd: 'rgba(236,72,153,0.05)',
    badge: 'Yapay Zeka',
    drawVisual: drawAIVisual,
  },
  {
    icon: 'LineChart',
    title: 'Finansal Analitik',
    desc: 'Gelir-gider tabloları, kategorik harcama analizleri ve etkileşimli SVG grafiklerle donatılmış gelişmiş finans yönetim paneli.',
    colorStart: 'rgba(16,185,129,0.2)',
    colorEnd: 'rgba(20,184,166,0.05)',
    badge: 'Muhasebe',
    drawVisual: drawFinanceVisual,
  },
  {
    icon: 'FileText',
    title: 'Markdown Editörü',
    desc: 'R2 bulut medya kütüphanesi entegrasyonu ve anlık canlı önizleme özelliği sunan zengin blog yazma ve not alma editörü.',
    colorStart: 'rgba(245,158,11,0.2)',
    colorEnd: 'rgba(249,115,22,0.05)',
    badge: 'Blog Editör',
    drawVisual: drawMarkdownVisual,
  },
  {
    icon: 'Image',
    title: 'Lokal WebP Dönüştürücü',
    desc: 'Resimleri tarayıcıda tamamen yerel (HTML5 Canvas) olarak işleyen, hiçbir sunucuya yüklemeden sıkıştıran gizlilik odaklı araç.',
    colorStart: 'rgba(6,182,212,0.2)',
    colorEnd: 'rgba(59,130,246,0.05)',
    badge: 'Resim Optimizasyon',
    drawVisual: drawWebPVisual,
  },
  {
    icon: 'CheckSquare',
    title: 'Üretkenlik Merkezi',
    desc: 'Yapılacaklar listesi (Todos), favori linklerin saklandığı yer imleri (Bookmarks) ve hızlı kod kütüphanesi (Snippets).',
    colorStart: 'rgba(244,63,94,0.2)',
    colorEnd: 'rgba(239,68,68,0.05)',
    badge: 'Ajanda',
    drawVisual: drawProductivityVisual,
  },
];

// ── Yield Helpers ────────────────────────────────────────────────────────────

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// ── Component ────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  const [cardImages, setCardImages] = useState<string[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const didGenerate = useRef(false);

  useEffect(() => {
    if (didGenerate.current) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const generateAll = async () => {
      if (didGenerate.current || cancelled) return;
      didGenerate.current = true;

      if (observer) observer.disconnect();

      // Wait for layout stability
      await new Promise((r) => setTimeout(r, 200));

      // Create one shared canvas for drawing
      const canvas = document.createElement('canvas');
      canvas.width = CARD_W * SCALE;
      canvas.height = CARD_H * SCALE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const images: string[] = [];
      for (let i = 0; i < MODULES.length; i++) {
        if (cancelled) return;
        try {
          const dataUrl = drawModuleCard(ctx, i);
          images.push(dataUrl);
          await yieldToMain();
        } catch (err) {
          console.error('Failed to render card', i, err);
        }
      }
      if (!cancelled && images.length === MODULES.length) {
        setCardImages(images);
      }
    };

    // Defer generation so it doesn't block page paint
    const idleId =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(() => generateAll(), { timeout: 4000 })
        : setTimeout(() => generateAll(), 500);

    // Also trigger via IntersectionObserver when user scrolls near
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            if (typeof idleId === 'number') {
              cancelIdleCallback(idleId);
            } else {
              clearTimeout(idleId);
            }
            generateAll();
          }
        },
        { rootMargin: '400px' }
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
    }

    return () => {
      cancelled = true;
      if (typeof idleId === 'number') {
        cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="py-24 border-t border-white/5 bg-black relative overflow-hidden"
    >
      <span
        className={`${orbitron.className} absolute opacity-0 pointer-events-none -z-50`}
        aria-hidden="true"
      >
        Orbitron Font Loader
      </span>

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[35vw] bg-white/[0.01] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/[0.02] rounded-full blur-[90px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          {/* Left: Text Content */}
          <div className="max-w-2xl lg:max-w-xl animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono tracking-widest uppercase text-neutral-300 mb-6">
              <Sparkles size={11} className="text-yellow-500 animate-pulse" />
              <span>Kişisel Ekosistem</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 leading-tight">
              Peki, Nedir
              <br />
              Bu Site?
            </h2>
            <p className="mt-6 text-neutral-350 text-lg sm:text-xl leading-relaxed font-light">
              Burası aslında benim internetteki küçük atölyem. Hem yaptığım projeleri
              paylaşıyorum hem de günlük hayatta işime yarayan küçük araçları burada
              toplayıp kullanıyorum.
            </p>
            <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed font-light">
              Kendi ihtiyaçlarıma göre şekillendirdiğim, yeni bir şeye ihtiyaç
              duydukça geliştirmeye devam ettiğim bir yer. Yani sadece sabit bir site
              değil, benimle birlikte büyüyüp değişen canlı bir köşe.
            </p>
          </div>

          {/* Right: Circular Gallery (WebGL) */}
          <div className="w-full h-[500px] lg:w-[60%] animate-on-scroll relative overflow-hidden flex items-center justify-center">
            {cardImages.length > 0 ? (
              <CircularGallery
                bend={1}
                textColor="#ffffff"
                borderRadius={0.05}
                scrollEase={0.05}
                font={`bold 24px ${orbitron.style.fontFamily}`}
                scrollSpeed={2}
                items={cardImages.map((img, idx) => ({
                  image: img,
                  text: MODULES[idx].title,
                }))}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-neutral-500 font-mono text-xs">
                <span className="w-6 h-6 rounded-full border border-t-transparent border-neutral-500 animate-spin" />
                <span>Modüller Hazırlanıyor...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
