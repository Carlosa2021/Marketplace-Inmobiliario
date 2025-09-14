// src/app/api/marketplace/listings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock data - same as in main listings route
const mockListings: any[] = [
  // ... same mock data as before
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const listing = mockListings.find((l) => l.id === params.id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await request.json();
    const listingIndex = mockListings.findIndex((l) => l.id === params.id);

    if (listingIndex === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Update the listing
    mockListings[listingIndex] = {
      ...mockListings[listingIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockListings[listingIndex]);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const listingIndex = mockListings.findIndex((l) => l.id === params.id);

    if (listingIndex === -1) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Remove the listing
    mockListings.splice(listingIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 },
    );
  }
}
