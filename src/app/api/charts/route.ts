import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VibeConfig } from '@/lib/vibe-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('Loading chart for session:', sessionId);

    // Get or create user session
    let session = await prisma.userSession.findUnique({
      where: { sessionId },
      include: {
        chart: {
          include: {
            chartData: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!session) {
      // Create new session
      session = await prisma.userSession.create({
        data: { sessionId },
        include: {
          chart: {
            include: {
              chartData: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });
    }

    // Update last active timestamp
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() }
    });

    return NextResponse.json({
      session,
      chart: session.chart,
      chartData: session.chart?.chartData[0]?.data || null,
      currentState: session.currentState
    });

  } catch (error) {
    console.error('Error loading chart:', error);
    return NextResponse.json({ error: 'Failed to load chart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, chartData, config, chartName, description } = body;

    if (!sessionId || !chartData || !config) {
      return NextResponse.json({ error: 'Session ID, chart data, and config are required' }, { status: 400 });
    }

    console.log('Saving chart for session:', sessionId, { dataLength: chartData.length, configKeys: Object.keys(config) });

    // Get or create user session
    let session = await prisma.userSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      session = await prisma.userSession.create({
        data: { sessionId }
      });
    }

    // Create or update chart
    let chart = await prisma.chart.findFirst({
      where: { 
        sessions: { some: { sessionId } },
        isActive: true 
      }
    });

    if (!chart) {
      // Create new chart
      chart = await prisma.chart.create({
        data: {
          name: chartName || `Chart ${new Date().toLocaleDateString()}`,
          description: description || null,
          config: config as VibeConfig,
          sessions: {
            connect: { id: session.id }
          }
        }
      });
    } else {
      // Update existing chart
      chart = await prisma.chart.update({
        where: { id: chart.id },
        data: {
          name: chartName || chart.name,
          description: description || chart.description,
          config: config as VibeConfig,
          updatedAt: new Date()
        }
      });
    }

    // Save chart data
    const savedChartData = await prisma.chartData.create({
      data: {
        chartId: chart.id,
        data: chartData
      }
    });

    // Update session with current state
    const currentState = {
      config,
      chartData,
      chartId: chart.id
    };

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        chartId: chart.id,
        currentState,
        lastActive: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      chart,
      chartData: savedChartData,
      session
    });

  } catch (error) {
    console.error('Error saving chart:', error);
    return NextResponse.json({ error: 'Failed to save chart' }, { status: 500 });
  }
} 