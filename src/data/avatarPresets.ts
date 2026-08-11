export const DEFAULT_OFFLINE_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23cbd5e1" stroke="%2364748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';

export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  gender?: 'boy' | 'girl' | 'neutral';
}

export const CARTOON_AVATARS: AvatarPreset[] = [
  {
    id: 'c1',
    name: 'Junge mit Brille',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
    gender: 'boy'
  },
  {
    id: 'c2',
    name: 'Mädchen mit Locken',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffd5dc',
    gender: 'girl'
  },
  {
    id: 'c3',
    name: 'Junge mit Cap',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=c0aede',
    gender: 'boy'
  },
  {
    id: 'c4',
    name: 'Mädchen mit Zopf',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffdfbf',
    gender: 'girl'
  },
  {
    id: 'c5',
    name: 'Cooler Junge',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=d1d4f9',
    gender: 'boy'
  },
  {
    id: 'c6',
    name: 'Mädchen mit Haarband',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora&backgroundColor=c0f2d8',
    gender: 'girl'
  },
  {
    id: 'c7',
    name: 'Freundlicher Schüler',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan&backgroundColor=ffe5b4',
    gender: 'boy'
  },
  {
    id: 'c8',
    name: 'Schülerin mit Brille',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=e2f0d9',
    gender: 'girl'
  },
  {
    id: 'c9',
    name: 'Junge mit Wuschelkopf',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=fce1e4',
    gender: 'boy'
  },
  {
    id: 'c10',
    name: 'Mädchen mit Bob',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=e8dff5',
    gender: 'girl'
  },
  {
    id: 'c11',
    name: 'Junge mit Hoodie',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&backgroundColor=fcf4dd',
    gender: 'boy'
  },
  {
    id: 'c12',
    name: 'Mädchen mit Pferdeschwanz',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=ddedf4',
    gender: 'girl'
  },
  {
    id: 'c13',
    name: 'Schüler mit Cappy',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=f0efeb',
    gender: 'boy'
  },
  {
    id: 'c14',
    name: 'Mädchen mit Brille',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffe5ec',
    gender: 'girl'
  },
  {
    id: 'c15',
    name: 'Schüler mit Afro',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian&backgroundColor=d8e2dc',
    gender: 'boy'
  },
  {
    id: 'c16',
    name: 'Mädchen mit Mütze',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=f3d5b5',
    gender: 'girl'
  }
];
