// =============================================
// M3U Playlist Parser Utility
// =============================================

import type { Channel, Playlist } from '../types';

/**
 * Extract resolution from channel name or tvg attributes
 */
function extractResolution(name: string, attrs: Record<string, string>): string {
  // Check common resolution patterns
  const patterns: Array<[RegExp, string]> = [
    [/\b4k\b|\b2160p?\b|\buhd\b/i, '4K'],
    [/\b1080p?\b|\bfhd\b/i, '1080p'],
    [/\b720p?\b|\bhd\b/i, '720p'],
    [/\b576p?\b/i, '576p'],
    [/\b480p?\b|\bsd\b/i, '480p'],
    [/\b360p?\b/i, '360p'],
  ];

  const combined = `${name} ${attrs['tvg-name'] || ''} ${attrs['group-title'] || ''}`;

  for (const [pattern, label] of patterns) {
    if (pattern.test(combined)) return label;
  }

  return '';
}

/**
 * Parse a single EXTINF line and extract attributes
 */
function parseExtinf(line: string): { duration: number; attrs: Record<string, string>; title: string } {
  const attrs: Record<string, string> = {};

  // Extract all key="value" pairs
  const attrRegex = /([\w-]+)="([^"]*?)"/g;
  let match;
  while ((match = attrRegex.exec(line)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }

  // Extract duration (number after #EXTINF:)
  const durationMatch = line.match(/#EXTINF:(-?\d+(?:\.\d+)?)/);
  const duration = durationMatch ? parseFloat(durationMatch[1]) : -1;

  // Extract title (everything after the last comma)
  const commaIdx = line.lastIndexOf(',');
  const title = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : '';

  return { duration, attrs, title };
}

/**
 * Generate a stable ID from playlist ID and channel URL
 */
function generateChannelId(playlistId: string, url: string, index: number): string {
  const hash = `${playlistId}-${index}-${url.slice(-20)}`;
  return hash.replace(/[^a-zA-Z0-9-]/g, '_');
}

/**
 * Parse an M3U playlist string into an array of Channel objects
 */
export function parseM3U(content: string, playlist: Playlist): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let channelIndex = 0;
  let pendingExtinf: { attrs: Record<string, string>; title: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith('#EXTM3U')) {
      // M3U header, skip
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      const { attrs, title } = parseExtinf(line);
      pendingExtinf = { attrs, title };
      continue;
    }

    // Skip other # lines (comments, etc.)
    if (line.startsWith('#')) {
      continue;
    }

    // This should be a URL line
    if (pendingExtinf && (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp') || line.includes('://'))) {
      const { attrs, title } = pendingExtinf;

      const name = attrs['tvg-name'] || title || `Channel ${channelIndex + 1}`;
      const group = attrs['group-title'] || 'General';
      const logo = attrs['tvg-logo'] || '';
      const tvgId = attrs['tvg-id'] || '';
      const resolution = extractResolution(name, attrs);

      channelIndex++;

      channels.push({
        id: generateChannelId(playlist.id, line, channelIndex),
        number: channelIndex,
        name,
        url: line,
        logo,
        group,
        tvgId,
        tvgName: name,
        resolution,
        playlistId: playlist.id,
      });

      pendingExtinf = null;
    } else if (pendingExtinf) {
      // URL line that doesn't look like http, could still be valid
      const { attrs, title } = pendingExtinf;
      const name = attrs['tvg-name'] || title || `Channel ${channelIndex + 1}`;
      const group = attrs['group-title'] || 'General';
      const logo = attrs['tvg-logo'] || '';
      const tvgId = attrs['tvg-id'] || '';
      const resolution = extractResolution(name, attrs);

      channelIndex++;

      channels.push({
        id: generateChannelId(playlist.id, line, channelIndex),
        number: channelIndex,
        name,
        url: line,
        logo,
        group,
        tvgId,
        tvgName: name,
        resolution,
        playlistId: playlist.id,
      });

      pendingExtinf = null;
    }
  }

  return channels;
}

/**
 * Fetch and parse an M3U playlist from a URL
 */
export async function fetchAndParseM3U(playlist: Playlist): Promise<Channel[]> {
  const response = await fetch(playlist.url, {
    headers: {
      'User-Agent': 'IPTV-Player/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseM3U(text, playlist);
}

/**
 * Extract unique categories from channels
 */
export function extractCategories(channels: Channel[]): string[] {
  const groups = new Set<string>();
  for (const ch of channels) {
    if (ch.group) groups.add(ch.group);
  }
  return Array.from(groups).sort();
}

/**
 * Get category icon based on category name
 */
export function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('news')) return 'news';
  if (lower.includes('sport')) return 'sports';
  if (lower.includes('movie') || lower.includes('film') || lower.includes('cinema')) return 'movies';
  if (lower.includes('entertainment') || lower.includes('entertain')) return 'entertainment';
  if (lower.includes('kid') || lower.includes('child') || lower.includes('cartoon')) return 'kids';
  if (lower.includes('music') || lower.includes('radio')) return 'music';
  if (lower.includes('religion') || lower.includes('spiritual') || lower.includes('devotional')) return 'religious';
  if (lower.includes('lifestyle') || lower.includes('life') || lower.includes('food') || lower.includes('travel')) return 'lifestyle';
  if (lower.includes('documentary') || lower.includes('docu')) return 'documentary';
  if (lower.includes('series') || lower.includes('drama')) return 'series';
  return 'general';
}
