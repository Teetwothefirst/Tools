import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Supabase Music platform...');

  // 1. Clean existing records
  await prisma.favoriteArtist.deleteMany({});
  await prisma.favoriteAlbum.deleteMany({});
  await prisma.userActivity.deleteMany({});
  await prisma.playlistTrack.deleteMany({});
  await prisma.playlist.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@music.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'user@music.com',
      name: 'Alex Rivera',
      password: hashedPassword,
      role: Role.USER,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  console.log(`👤 Created Users: ${admin.email}, ${demoUser.email}`);

  // 3. Create Artists
  const artist1 = await prisma.artist.create({
    data: {
      name: 'Lumina Sound',
      bio: 'Electronic & Synthwave duo crafting immersive nocturnal soundscapes and retro-futuristic rhythms.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    },
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'Acoustic Horizon',
      bio: 'Indie folk collective delivering organic acoustic melodies, warm vocal harmonies, and soulful ballads.',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    },
  });

  const artist3 = await prisma.artist.create({
    data: {
      name: 'Neon Velocity',
      bio: 'High-octane synthwave and cyberpunk producer driven by driving basslines and analog synthesizers.',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    },
  });

  console.log(`🎨 Created Artists: ${artist1.name}, ${artist2.name}, ${artist3.name}`);

  // 4. Create Albums
  const album1 = await prisma.album.create({
    data: {
      title: 'Midnight Transmission',
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600',
      releaseDate: new Date('2025-06-15'),
      artistId: artist1.id,
    },
  });

  const album2 = await prisma.album.create({
    data: {
      title: 'Whispering Pines',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
      releaseDate: new Date('2025-09-01'),
      artistId: artist2.id,
    },
  });

  const album3 = await prisma.album.create({
    data: {
      title: 'Cyberpunk Odyssey',
      coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      releaseDate: new Date('2026-01-20'),
      artistId: artist3.id,
    },
  });

  console.log(`💿 Created Albums: ${album1.title}, ${album2.title}, ${album3.title}`);

  // 5. Create Tracks (with public sample audio streaming URLs)
  const tracks = await Promise.all([
    prisma.track.create({
      data: {
        title: 'Neon Nights',
        audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
        duration: 184,
        playCount: 1420,
        artistId: artist1.id,
        albumId: album1.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Starlight Echoes',
        audioUrl: 'https://cdn.freesound.org/previews/568/568854_11861866-lq.mp3',
        duration: 215,
        playCount: 980,
        artistId: artist1.id,
        albumId: album1.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Golden Timber',
        audioUrl: 'https://cdn.freesound.org/previews/554/554162_11861866-lq.mp3',
        duration: 198,
        playCount: 830,
        artistId: artist2.id,
        albumId: album2.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Mountain Breeze',
        audioUrl: 'https://cdn.freesound.org/previews/530/530415_11861866-lq.mp3',
        duration: 172,
        playCount: 1250,
        artistId: artist2.id,
        albumId: album2.id,
      },
    }),
    prisma.track.create({
      data: {
        title: 'Grid Runner 2099',
        audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
        duration: 240,
        playCount: 3100,
        artistId: artist3.id,
        albumId: album3.id,
      },
    }),
  ]);

  console.log(`🎶 Created ${tracks.length} Tracks.`);

  // 6. Create User Likes & Playlists
  await prisma.like.create({
    data: {
      userId: demoUser.id,
      trackId: tracks[0].id,
    },
  });

  await prisma.like.create({
    data: {
      userId: demoUser.id,
      trackId: tracks[4].id,
    },
  });

  const playlist = await prisma.playlist.create({
    data: {
      title: 'Late Night Synth & Chill',
      description: 'My favorite tracks for coding and nocturnal deep focus.',
      userId: demoUser.id,
      tracks: {
        create: [
          { trackId: tracks[0].id, order: 1 },
          { trackId: tracks[4].id, order: 2 },
          { trackId: tracks[1].id, order: 3 },
        ],
      },
    },
  });

  console.log(`📝 Created Playlist: ${playlist.title}`);

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
