// src/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PropertyMetadata } from '@/modules/tokenization/types';

// In-memory storage (replace with your database)
const properties: PropertyMetadata[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const property = properties.find((p) => p.id === params.id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
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
    const propertyIndex = properties.findIndex((p) => p.id === params.id);

    if (propertyIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 },
      );
    }

    // Update property
    properties[propertyIndex] = {
      ...properties[propertyIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      property: properties[propertyIndex],
      message: 'Property updated successfully',
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const propertyIndex = properties.findIndex((p) => p.id === params.id);

    if (propertyIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 },
      );
    }

    properties.splice(propertyIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 },
    );
  }
}
