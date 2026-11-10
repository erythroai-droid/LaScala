import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Apple touch icon — same mark as icon.svg */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#14110e', borderRadius: 40, position: 'relative' }}>
        <div style={{ position: 'absolute', width: 132, height: 132, borderRadius: 999, border: '3px solid rgba(208,182,124,0.55)' }} />
        <div style={{ fontSize: 104, fontStyle: 'italic', color: '#f2ecdf', fontFamily: 'Georgia, Times New Roman, serif', lineHeight: 1 }}>S</div>
      </div>
    ),
    { ...size },
  );
}
