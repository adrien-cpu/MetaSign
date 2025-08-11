import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET() {
  try {
    const [culturalHub, gaming, cinema, news, business, travel] = await Promise.all([
      prisma.culturalHub.findMany({
        where: { isActive: true }
      }),
      prisma.gaming.findMany({
        where: { status: 'ACTIVE' }
      }),
      prisma.cinema.findMany({
        where: { status: 'ACTIVE' }
      }),
      prisma.news.findMany({
        where: { isLive: true }
      }),
      prisma.business.findMany({
        where: { status: 'ACTIVE' }
      }),
      prisma.travel.findMany({
        where: { status: 'ACTIVE' }
      })
    ]);

    return NextResponse.json({
      culturalHub,
      gaming,
      cinema,
      news,
      business,
      travel
    });
  } catch (error) {
    console.error('Failed to fetch platforms:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, name, ...data } = await request.json();

    let platform;
    switch (type) {
      case 'cultural':
        platform = await prisma.culturalHub.create({
          data: {
            tourName: name,
            type: 'VIRTUAL_TOUR',
            startDate: new Date(),
            ...data
          }
        });
        break;
      case 'gaming':
        platform = await prisma.gaming.create({
          data: {
            tournamentName: name,
            ...data
          }
        });
        break;
      case 'cinema':
        platform = await prisma.cinema.create({
          data: {
            productionName: name,
            type: 'PRODUCTION',
            startDate: new Date(),
            ...data
          }
        });
        break;
      default:
        throw new Error('Invalid platform type');
    }

    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    console.error('Failed to create platform:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, type, ...data } = await request.json();

    let updated;
    switch (type) {
      case 'cultural':
        updated = await prisma.culturalHub.update({
          where: { id },
          data
        });
        break;
      case 'gaming':
        updated = await prisma.gaming.update({
          where: { id },
          data
        });
        break;
      case 'cinema':
        updated = await prisma.cinema.update({
          where: { id },
          data
        });
        break;
      default:
        throw new Error('Invalid platform type');
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update platform:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, type } = await request.json();

    switch (type) {
      case 'cultural':
        await prisma.culturalHub.delete({
          where: { id }
        });
        break;
      case 'gaming':
        await prisma.gaming.delete({
          where: { id }
        });
        break;
      case 'cinema':
        await prisma.cinema.delete({
          where: { id }
        });
        break;
      default:
        throw new Error('Invalid platform type');
    }

    return NextResponse.json(
      { message: 'Platform deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete platform:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
