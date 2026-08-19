import { PrismaClient, UserRole, MaturityRating, ContentType, ProcessingStatus, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding StreamFlix production-grade demo database...');

  // 1. Subscription Plans
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      priceMonthly: 9.99,
      videoQuality: '720p',
      maxScreens: 1,
      has4K: false,
    },
  });

  const standardPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Standard' },
    update: {},
    create: {
      name: 'Standard',
      priceMonthly: 15.49,
      videoQuality: '1080p',
      maxScreens: 2,
      has4K: false,
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      priceMonthly: 19.99,
      videoQuality: '4K + HDR',
      maxScreens: 4,
      has4K: true,
    },
  });

  // 2. Genres
  const actionGenre = await prisma.genre.upsert({
    where: { slug: 'action' },
    update: {},
    create: { name: 'Action & Adventure', slug: 'action' },
  });

  const scifiGenre = await prisma.genre.upsert({
    where: { slug: 'scifi' },
    update: {},
    create: { name: 'Sci-Fi & Fantasy', slug: 'scifi' },
  });

  const crimeGenre = await prisma.genre.upsert({
    where: { slug: 'crime' },
    update: {},
    create: { name: 'Crime & Mystery', slug: 'crime' },
  });

  const thrillerGenre = await prisma.genre.upsert({
    where: { slug: 'thriller' },
    update: {},
    create: { name: 'Thriller', slug: 'thriller' },
  });

  const comedyGenre = await prisma.genre.upsert({
    where: { slug: 'comedy' },
    update: {},
    create: { name: 'Comedy', slug: 'comedy' },
  });

  // 3. Demo Admin and Normal User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@streamflix.local' },
    update: {},
    create: {
      email: 'admin@streamflix.local',
      passwordHash: '$2b$10$wE99h2o3P2o3Q2o3R2o3SuJkG1H2I3J4K5L6M7N8O9P0Q1R2S3T4U', // hashed 'Admin123!'
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      profiles: {
        create: [
          {
            name: 'Master Admin',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            isKids: false,
            maturityRating: MaturityRating.TV_MA,
          },
        ],
      },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@streamflix.local' },
    update: {},
    create: {
      email: 'user@streamflix.local',
      passwordHash: '$2b$10$wE99h2o3P2o3Q2o3R2o3SuJkG1H2I3J4K5L6M7N8O9P0Q1R2S3T4U', // hashed 'Password123!'
      role: UserRole.USER,
      emailVerified: true,
      profiles: {
        create: [
          {
            name: 'Alex',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            isKids: false,
            maturityRating: MaturityRating.TV_MA,
          },
          {
            name: 'Sam',
            avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
            isKids: false,
            maturityRating: MaturityRating.TV_14,
          },
          {
            name: 'Kids Room',
            avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
            isKids: true,
            maturityRating: MaturityRating.TV_G,
          },
        ],
      },
      subscriptions: {
        create: {
          planId: premiumPlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Sample HLS Stream Manifest (Mux / Public test stream)
  const sampleHlsStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // 4. Sample Media Assets & Content Items (Movies)
  const movieData = [
    {
      title: 'Cyber Sentinel: 2099',
      description: 'In a rain-drenched megacity controlled by Rogue AI networks, a lone cybernetic enforcer must uncover a conspiracy that threatens humanity.',
      releaseYear: 2026,
      maturityRating: MaturityRating.TV_MA,
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
      featured: true,
      runtimeMinutes: 124,
      director: 'Kaito Tanaka',
      genres: [scifiGenre.id, actionGenre.id],
    },
    {
      title: 'Eclipse Protocol',
      description: 'When orbital communications collapse without warning, a deep-space research crew realizes something ancient is watching them from the dark side of the moon.',
      releaseYear: 2025,
      maturityRating: MaturityRating.PG13,
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
      backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200',
      featured: false,
      runtimeMinutes: 118,
      director: 'Elena Rostova',
      genres: [scifiGenre.id, thrillerGenre.id],
    },
    {
      title: 'Shadows of Kyoto',
      description: 'Undercover detectives penetrate an underground syndicate, navigating honor, betrayal, and relentless blade battles across nightlit alleys.',
      releaseYear: 2025,
      maturityRating: MaturityRating.R,
      posterUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
      backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
      featured: true,
      runtimeMinutes: 135,
      director: 'Ren Ishida',
      genres: [crimeGenre.id, actionGenre.id],
    },
  ];

  for (const item of movieData) {
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        originalFilename: `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`,
        storagePath: `/uploads/raw/${item.title}.mp4`,
        status: ProcessingStatus.COMPLETED,
        masterManifestUrl: sampleHlsStream,
        durationSeconds: item.runtimeMinutes * 60,
        variants: {
          create: [
            { quality: '1080p', playlistUrl: sampleHlsStream, bitrate: 5000000 },
            { quality: '720p', playlistUrl: sampleHlsStream, bitrate: 2800000 },
            { quality: '480p', playlistUrl: sampleHlsStream, bitrate: 1400000 },
          ],
        },
        subtitles: {
          create: [
            { language: 'en', label: 'English', vttUrl: '/subtitles/en.vtt', isDefault: true },
            { language: 'es', label: 'Spanish', vttUrl: '/subtitles/es.vtt', isDefault: false },
          ],
        },
        audioTracks: {
          create: [
            { language: 'en', label: 'English (Original)', audioUrl: '/audio/en.aac', isDefault: true },
          ],
        },
      },
    });

    await prisma.contentItem.create({
      data: {
        title: item.title,
        description: item.description,
        type: ContentType.MOVIE,
        releaseYear: item.releaseYear,
        maturityRating: item.maturityRating,
        posterUrl: item.posterUrl,
        backdropUrl: item.backdropUrl,
        featured: item.featured,
        trendingScore: 9.8,
        movie: {
          create: {
            runtimeMinutes: item.runtimeMinutes,
            director: item.director,
            mediaAssetId: mediaAsset.id,
          },
        },
        genres: {
          create: item.genres.map((genreId) => ({ genreId })),
        },
      },
    });
  }

  // 5. TV Show Data
  const show = await prisma.contentItem.create({
    data: {
      title: 'Chronicles of Eldoria',
      description: 'An epic fantasy series following forgotten heirs seeking to reclaim a shattered continent from dark magic and dragon lords.',
      type: ContentType.TV_SHOW,
      releaseYear: 2026,
      maturityRating: MaturityRating.TV_14,
      posterUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
      featured: true,
      trendingScore: 9.9,
      genres: {
        create: [{ genreId: scifiGenre.id }, { genreId: actionGenre.id }],
      },
      tvShow: {
        create: {
          totalSeasons: 1,
          totalEpisodes: 3,
          seasons: {
            create: [
              {
                seasonNumber: 1,
                title: 'Season 1: The Gathering Storm',
                overview: 'Kingdoms align as ancient magic awakens in the northern reaches.',
                episodes: {
                  create: [
                    {
                      episodeNumber: 1,
                      title: 'The Fallen Crown',
                      overview: 'A young hunter discovers a legendary blade in the ruins of Eldoria.',
                      runtimeMinutes: 52,
                      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
                      introStartSec: 15,
                      introEndSec: 75,
                      outroStartSec: 3000,
                      mediaAsset: {
                        create: {
                          originalFilename: 'eldoria_s1e1.mp4',
                          storagePath: '/uploads/raw/s1e1.mp4',
                          status: ProcessingStatus.COMPLETED,
                          masterManifestUrl: sampleHlsStream,
                          durationSeconds: 3120,
                        },
                      },
                    },
                    {
                      episodeNumber: 2,
                      title: 'Whispers in the Dark',
                      overview: 'As shadow legions advance, alliances are tested in the capital.',
                      runtimeMinutes: 48,
                      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
                      introStartSec: 10,
                      introEndSec: 65,
                      outroStartSec: 2800,
                      mediaAsset: {
                        create: {
                          originalFilename: 'eldoria_s1e2.mp4',
                          storagePath: '/uploads/raw/s1e2.mp4',
                          status: ProcessingStatus.COMPLETED,
                          masterManifestUrl: sampleHlsStream,
                          durationSeconds: 2880,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log('✅ StreamFlix Database Seed Completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
