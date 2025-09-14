// src/modules/marketplace/marketplace-provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { MarketplaceEngine } from './marketplace-engine';
import {
  MarketplaceListing,
  Bid,
  Trade,
  MarketplaceOffer,
  MarketAnalytics,
  LiquidityPool,
} from './types';

interface MarketplaceState {
  // Listings
  listings: MarketplaceListing[];
  activeListings: MarketplaceListing[];
  userListings: MarketplaceListing[];
  featuredListings: MarketplaceListing[];

  // Trading
  userBids: Bid[];
  userTrades: Trade[];
  watchlist: string[];

  // Analytics
  marketAnalytics: Record<string, MarketAnalytics>;
  marketTrends: any[];

  // Liquidity
  liquidityPools: LiquidityPool[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedListing: MarketplaceListing | null;
  searchQuery: string;
  sortBy: 'price' | 'recent' | 'popular' | 'ending_soon';
  filterBy: {
    priceRange: [number, number];
    location: string[];
    propertyType: string[];
    listingType: string[];
  };

  // Real-time data
  priceUpdates: Record<string, number>;
  bidsCount: Record<string, number>;
  onlineUsers: number;
}

type MarketplaceAction =
  | { type: 'SET_LISTINGS'; payload: MarketplaceListing[] }
  | { type: 'ADD_LISTING'; payload: MarketplaceListing }
  | { type: 'UPDATE_LISTING'; payload: MarketplaceListing }
  | { type: 'SET_USER_LISTINGS'; payload: MarketplaceListing[] }
  | { type: 'SET_FEATURED_LISTINGS'; payload: MarketplaceListing[] }
  | { type: 'ADD_BID'; payload: Bid }
  | { type: 'SET_USER_BIDS'; payload: Bid[] }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'SET_USER_TRADES'; payload: Trade[] }
  | { type: 'ADD_TO_WATCHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | {
      type: 'SET_MARKET_ANALYTICS';
      payload: { propertyId: string; analytics: MarketAnalytics };
    }
  | { type: 'SET_LIQUIDITY_POOLS'; payload: LiquidityPool[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_LISTING'; payload: MarketplaceListing | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: MarketplaceState['sortBy'] }
  | { type: 'SET_FILTER'; payload: Partial<MarketplaceState['filterBy']> }
  | { type: 'UPDATE_PRICE'; payload: { listingId: string; price: number } }
  | { type: 'UPDATE_BIDS_COUNT'; payload: { listingId: string; count: number } }
  | { type: 'SET_ONLINE_USERS'; payload: number };

const initialState: MarketplaceState = {
  listings: [],
  activeListings: [],
  userListings: [],
  featuredListings: [],
  userBids: [],
  userTrades: [],
  watchlist: [],
  marketAnalytics: {},
  marketTrends: [],
  liquidityPools: [],
  isLoading: false,
  error: null,
  selectedListing: null,
  searchQuery: '',
  sortBy: 'recent',
  filterBy: {
    priceRange: [0, 10000000],
    location: [],
    propertyType: [],
    listingType: [],
  },
  priceUpdates: {},
  bidsCount: {},
  onlineUsers: 0,
};

function marketplaceReducer(
  state: MarketplaceState,
  action: MarketplaceAction,
): MarketplaceState {
  switch (action.type) {
    case 'SET_LISTINGS':
      return {
        ...state,
        listings: action.payload,
        activeListings: action.payload.filter((l) => l.status === 'active'),
      };

    case 'ADD_LISTING':
      const newListings = [...state.listings, action.payload];
      return {
        ...state,
        listings: newListings,
        activeListings: newListings.filter((l) => l.status === 'active'),
      };

    case 'UPDATE_LISTING':
      const updatedListings = state.listings.map((l) =>
        l.id === action.payload.id ? action.payload : l,
      );
      return {
        ...state,
        listings: updatedListings,
        activeListings: updatedListings.filter((l) => l.status === 'active'),
        selectedListing:
          state.selectedListing?.id === action.payload.id
            ? action.payload
            : state.selectedListing,
      };

    case 'SET_USER_LISTINGS':
      return { ...state, userListings: action.payload };

    case 'SET_FEATURED_LISTINGS':
      return { ...state, featuredListings: action.payload };

    case 'ADD_BID':
      return {
        ...state,
        userBids: [...state.userBids, action.payload],
      };

    case 'SET_USER_BIDS':
      return { ...state, userBids: action.payload };

    case 'ADD_TRADE':
      return {
        ...state,
        userTrades: [...state.userTrades, action.payload],
      };

    case 'SET_USER_TRADES':
      return { ...state, userTrades: action.payload };

    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      };

    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter((id) => id !== action.payload),
      };

    case 'SET_MARKET_ANALYTICS':
      return {
        ...state,
        marketAnalytics: {
          ...state.marketAnalytics,
          [action.payload.propertyId]: action.payload.analytics,
        },
      };

    case 'SET_LIQUIDITY_POOLS':
      return { ...state, liquidityPools: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SELECT_LISTING':
      return { ...state, selectedListing: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filterBy: { ...state.filterBy, ...action.payload },
      };

    case 'UPDATE_PRICE':
      return {
        ...state,
        priceUpdates: {
          ...state.priceUpdates,
          [action.payload.listingId]: action.payload.price,
        },
      };

    case 'UPDATE_BIDS_COUNT':
      return {
        ...state,
        bidsCount: {
          ...state.bidsCount,
          [action.payload.listingId]: action.payload.count,
        },
      };

    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };

    default:
      return state;
  }
}

interface MarketplaceContextType {
  state: MarketplaceState;

  // Listing management
  createListing: (
    listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<MarketplaceListing>;
  updateListing: (
    listingId: string,
    updates: Partial<MarketplaceListing>,
  ) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  getListing: (listingId: string) => MarketplaceListing | undefined;

  // Trading
  placeBid: (
    listingId: string,
    bid: Omit<Bid, 'id' | 'timestamp'>,
  ) => Promise<Bid>;
  acceptBid: (listingId: string, bidId: string) => Promise<Trade>;
  buyNow: (
    listingId: string,
    quantity?: number,
    paymentMethod?: string,
  ) => Promise<Trade>;
  makeOffer: (
    listingId: string,
    offer: Omit<MarketplaceOffer, 'id' | 'timestamp'>,
  ) => Promise<MarketplaceOffer>;

  // Watchlist
  addToWatchlist: (listingId: string) => void;
  removeFromWatchlist: (listingId: string) => void;
  isInWatchlist: (listingId: string) => boolean;

  // Analytics
  getMarketAnalytics: (propertyId: string) => Promise<MarketAnalytics>;

  // Liquidity
  createLiquidityPool: (
    propertyToken: string,
    pairedToken: string,
    initialLiquidity: number,
    fee: number,
  ) => Promise<LiquidityPool>;

  // Search and filtering
  searchListings: (query: string) => void;
  setSortBy: (sortBy: MarketplaceState['sortBy']) => void;
  setFilter: (filter: Partial<MarketplaceState['filterBy']>) => void;
  getFilteredListings: () => MarketplaceListing[];

  // UI helpers
  selectListing: (listing: MarketplaceListing | null) => void;
  clearError: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined,
);

interface MarketplaceProviderProps {
  children: ReactNode;
}

export function MarketplaceProvider({ children }: MarketplaceProviderProps) {
  const [state, dispatch] = useReducer(marketplaceReducer, initialState);
  const marketplaceEngine = new MarketplaceEngine();

  // Initialize marketplace data
  useEffect(() => {
    loadInitialData();
    setupRealTimeUpdates();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load listings
      const listingsResponse = await fetch('/api/marketplace/listings');
      const listings = await listingsResponse.json();
      dispatch({ type: 'SET_LISTINGS', payload: listings });

      // Load featured listings
      const featuredResponse = await fetch(
        '/api/marketplace/listings/featured',
      );
      const featured = await featuredResponse.json();
      dispatch({ type: 'SET_FEATURED_LISTINGS', payload: featured });

      // Load liquidity pools
      const poolsResponse = await fetch('/api/marketplace/liquidity-pools');
      const pools = await poolsResponse.json();
      dispatch({ type: 'SET_LIQUIDITY_POOLS', payload: pools });
    } catch (error) {
      console.error('Failed to load initial data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load marketplace data',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setupRealTimeUpdates = () => {
    // WebSocket for real-time price updates
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'price_update':
          dispatch({
            type: 'UPDATE_PRICE',
            payload: { listingId: data.listingId, price: data.price },
          });
          break;

        case 'new_bid':
          dispatch({
            type: 'UPDATE_BIDS_COUNT',
            payload: { listingId: data.listingId, count: data.count },
          });
          break;

        case 'listing_updated':
          dispatch({ type: 'UPDATE_LISTING', payload: data.listing });
          break;

        case 'online_users':
          dispatch({ type: 'SET_ONLINE_USERS', payload: data.count });
          break;
      }
    };

    return () => ws.close();
  };

  // Listing management functions
  const createListing = async (
    listingData: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      const listing = await marketplaceEngine.createListing(listingData);
      dispatch({ type: 'ADD_LISTING', payload: listing });
      return listing;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create listing' });
      throw error;
    }
  };

  const updateListing = async (
    listingId: string,
    updates: Partial<MarketplaceListing>,
  ) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const updatedListing = await response.json();
      dispatch({ type: 'UPDATE_LISTING', payload: updatedListing });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update listing' });
      throw error;
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'DELETE',
      });

      const updatedListings = state.listings.filter((l) => l.id !== listingId);
      dispatch({ type: 'SET_LISTINGS', payload: updatedListings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete listing' });
      throw error;
    }
  };

  const getListing = (listingId: string) => {
    return state.listings.find((l) => l.id === listingId);
  };

  // Trading functions
  const placeBid = async (
    listingId: string,
    bidData: Omit<Bid, 'id' | 'timestamp'>,
  ) => {
    try {
      const bid = await marketplaceEngine.placeBid(listingId, bidData);
      dispatch({ type: 'ADD_BID', payload: bid });
      return bid;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to place bid' });
      throw error;
    }
  };

  const acceptBid = async (listingId: string, bidId: string) => {
    try {
      const trade = await marketplaceEngine.acceptBid(listingId, bidId);
      dispatch({ type: 'ADD_TRADE', payload: trade });
      return trade;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to accept bid' });
      throw error;
    }
  };

  const buyNow = async (
    listingId: string,
    quantity?: number,
    paymentMethod?: string,
  ) => {
    try {
      const trade = await marketplaceEngine.executePurchase(
        listingId,
        'current_user',
        quantity,
        paymentMethod,
      );
      dispatch({ type: 'ADD_TRADE', payload: trade });
      return trade;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete purchase' });
      throw error;
    }
  };

  const makeOffer = async (
    listingId: string,
    offerData: Omit<MarketplaceOffer, 'id' | 'timestamp'>,
  ) => {
    try {
      const response = await fetch('/api/marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...offerData, listingId }),
      });

      return await response.json();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to make offer' });
      throw error;
    }
  };

  // Watchlist functions
  const addToWatchlist = (listingId: string) => {
    dispatch({ type: 'ADD_TO_WATCHLIST', payload: listingId });
  };

  const removeFromWatchlist = (listingId: string) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: listingId });
  };

  const isInWatchlist = (listingId: string) => {
    return state.watchlist.includes(listingId);
  };

  // Analytics functions
  const getMarketAnalytics = async (propertyId: string) => {
    try {
      const analytics = await marketplaceEngine.getMarketAnalytics(propertyId);
      dispatch({
        type: 'SET_MARKET_ANALYTICS',
        payload: { propertyId, analytics },
      });
      return analytics;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to get market analytics',
      });
      throw error;
    }
  };

  // Liquidity functions
  const createLiquidityPool = async (
    propertyToken: string,
    pairedToken: string,
    initialLiquidity: number,
    fee: number,
  ) => {
    try {
      const pool = await marketplaceEngine.createLiquidityPool(
        propertyToken,
        pairedToken,
        initialLiquidity,
        fee,
      );
      const updatedPools = [...state.liquidityPools, pool];
      dispatch({ type: 'SET_LIQUIDITY_POOLS', payload: updatedPools });
      return pool;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to create liquidity pool',
      });
      throw error;
    }
  };

  // Search and filtering functions
  const searchListings = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSortBy = (sortBy: MarketplaceState['sortBy']) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const setFilter = (filter: Partial<MarketplaceState['filterBy']>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const getFilteredListings = () => {
    let filtered = state.activeListings;

    // Apply search filter
    if (state.searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          listing.description
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()) ||
          listing.location
            .toLowerCase()
            .includes(state.searchQuery.toLowerCase()),
      );
    }

    // Apply price filter
    filtered = filtered.filter(
      (listing) =>
        listing.price.amount >= state.filterBy.priceRange[0] &&
        listing.price.amount <= state.filterBy.priceRange[1],
    );

    // Apply location filter
    if (state.filterBy.location.length > 0) {
      filtered = filtered.filter((listing) =>
        state.filterBy.location.includes(listing.location),
      );
    }

    // Apply property type filter
    if (state.filterBy.propertyType.length > 0) {
      filtered = filtered.filter((listing) =>
        state.filterBy.propertyType.includes(
          listing.metadata?.propertyType || '',
        ),
      );
    }

    // Apply listing type filter
    if (state.filterBy.listingType.length > 0) {
      filtered = filtered.filter((listing) =>
        state.filterBy.listingType.includes(listing.listingType),
      );
    }

    // Apply sorting
    switch (state.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'popular':
        filtered.sort(
          (a, b) => (state.bidsCount[b.id] || 0) - (state.bidsCount[a.id] || 0),
        );
        break;
      case 'ending_soon':
        filtered = filtered
          .filter(
            (listing) => listing.listingType === 'auction' && listing.auction,
          )
          .sort((a, b) => {
            const endA = new Date(a.auction!.endTime).getTime();
            const endB = new Date(b.auction!.endTime).getTime();
            return endA - endB;
          });
        break;
    }

    return filtered;
  };

  // UI helper functions
  const selectListing = (listing: MarketplaceListing | null) => {
    dispatch({ type: 'SELECT_LISTING', payload: listing });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: MarketplaceContextType = {
    state,
    createListing,
    updateListing,
    deleteListing,
    getListing,
    placeBid,
    acceptBid,
    buyNow,
    makeOffer,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getMarketAnalytics,
    createLiquidityPool,
    searchListings,
    setSortBy,
    setFilter,
    getFilteredListings,
    selectListing,
    clearError,
  };

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
