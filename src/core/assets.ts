export type ImageMap<K extends string> = Record<K, HTMLImageElement>;

/** Load a set of images by URL; resolves when every one has decoded. */
export async function loadImages<K extends string>(sources: Record<K, string>): Promise<ImageMap<K>> {
  const entries = Object.entries(sources) as [K, string][];
  const loaded = await Promise.all(
    entries.map(async ([key, src]) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return [key, img] as const;
    }),
  );
  return Object.fromEntries(loaded) as ImageMap<K>;
}

export const spriteSources = {
  trex1: '/assets/trex1.png',
  trex3: '/assets/trex3.png',
  trex4: '/assets/trex4.png',
  trexCollided: '/assets/trex_collided.png',
  ground: '/assets/ground2.png',
  cloud: '/assets/cloud.png',
  gameOver: '/assets/gameOver.png',
  restart: '/assets/restart.png',
  obstacle1: '/assets/obstacle1.png',
  obstacle2: '/assets/obstacle2.png',
  obstacle3: '/assets/obstacle3.png',
  obstacle4: '/assets/obstacle4.png',
  obstacle5: '/assets/obstacle5.png',
  obstacle6: '/assets/obstacle6.png',
} as const;

export type SpriteKey = keyof typeof spriteSources;
export type Sprites = ImageMap<SpriteKey>;
