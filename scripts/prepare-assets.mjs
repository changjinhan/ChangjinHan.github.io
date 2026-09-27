import { cpSync, mkdirSync } from 'node:fs';
mkdirSync('public/assets', { recursive: true });
cpSync('assets/images', 'public/assets/images', { recursive: true });
cpSync('ads.txt', 'public/ads.txt');
