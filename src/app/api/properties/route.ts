// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PropertyMetadata } from '@/modules/tokenization/types';

// In-memory storage (replace with your database)
const properties: PropertyMetadata[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const type = url.searchParams.get('type');
    const city = url.searchParams.get('city');
    const minValue = parseFloat(url.searchParams.get('minValue') || '0');
    const maxValue = parseFloat(
      url.searchParams.get('maxValue') || '999999999',
    );

    // Filter properties
    let filteredProperties = properties;

    if (type) {
      filteredProperties = filteredProperties.filter(
        (p) => p.specifications.type === type,
      );
    }

    if (city) {
      filteredProperties = filteredProperties.filter((p) =>
        p.location.city.toLowerCase().includes(city.toLowerCase()),
      );
    }

    filteredProperties = filteredProperties.filter(
      (p) =>
        p.valuation.currentValue >= minValue &&
        p.valuation.currentValue <= maxValue,
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      properties: paginatedProperties,
      total: filteredProperties.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProperties.length / limit),
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const property: PropertyMetadata = await request.json();

    // Validate required fields
    if (!property.id || !property.name || !property.location.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if property already exists
    const existingProperty = properties.find((p) => p.id === property.id);
    if (existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property already exists' },
        { status: 409 },
      );
    }

    // Add timestamps
    const timestamp = new Date().toISOString();
    const propertyWithTimestamp: PropertyMetadata = {
      ...property,
      valuation: {
        ...property.valuation,
        lastAppraisal: timestamp,
      },
    };

    properties.push(propertyWithTimestamp);

    return NextResponse.json({
      success: true,
      property: propertyWithTimestamp,
      message: 'Property registered successfully',
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 },
    );
  }
}
