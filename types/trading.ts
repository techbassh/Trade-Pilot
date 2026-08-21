// Normalized TradePilot Domain Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UserProfile {
  userId: string;
  userName: string;
  userShortName: string;
  email: string;
  broker: string;
  exchanges: string[];
  products: string[];
  orderTypes: string[];
  avatarUrl?: string;
  loginTime?: string;
}

export interface Holding {
  symbol: string;
  exchange: string;
  instrumentToken: number;
  isin: string;
  product: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  closePrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

export interface Position {
  symbol: string;
  exchange: string;
  instrumentToken: number;
  product: "CNC" | "MIS" | "NRML";
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  closePrice: number;
  pnl: number;
  pnlPercentage: number;
  dayPnl: number;
  buyQuantity: number;
  buyPrice: number;
  sellQuantity: number;
  sellPrice: number;
  value: number;
  isOvernight: boolean;
}

export interface PositionsSummary {
  net: Position[];
  day: Position[];
  totalPnl: number;
  totalDayPnl: number;
}

export interface Funds {
  availableCash: number;
  availableCollateral: number;
  usedMargin: number;
  netAvailable: number;
  openingBalance: number;
  payin: number;
  spanMargin: number;
  exposureMargin: number;
}

export interface Order {
  orderId: string;
  symbol: string;
  exchange: "NSE" | "BSE" | "NFO" | "CDS" | "MCX";
  instrumentToken: number;
  transactionType: "BUY" | "SELL";
  quantity: number;
  filledQuantity: number;
  pendingQuantity: number;
  orderType: "MARKET" | "LIMIT" | "SL" | "SL-M";
  product: "CNC" | "MIS" | "NRML";
  price: number;
  triggerPrice: number;
  averagePrice: number;
  status: "COMPLETE" | "REJECTED" | "CANCELLED" | "OPEN" | "TRIGGER PENDING" | "PUT ORDER REQ RECEIVED";
  statusMessage: string | null;
  validity: "DAY" | "IOC" | "TTL";
  variety: "regular" | "amo" | "co" | "iceberg" | "auction";
  orderTimestamp: string;
  exchangeTimestamp: string | null;
}

export interface PlaceOrderRequest {
  exchange: "NSE" | "BSE";
  tradingsymbol: string;
  transactionType: "BUY" | "SELL";
  quantity: number;
  orderType: "MARKET" | "LIMIT";
  product: "CNC" | "MIS";
  price?: number;
  triggerPrice?: number;
  validity?: "DAY" | "IOC";
  variety?: "regular";
}

export interface Quote {
  instrumentToken: number;
  tradingsymbol: string;
  exchange: string;
  lastPrice: number;
  netChange: number;
  percentageChange: number;
  averagePrice: number;
  volume: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  timestamp: string;
}

export interface CandleData {
  time: string | number; // YYYY-MM-DD or unix timestamp for lightweight charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LiveQuoteEvent {
  type: "quote";
  instrumentToken: number;
  tradingsymbol?: string;
  lastPrice: number;
  change?: number;
  changePercent?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume?: number;
  timestamp: number;
}

export interface LiveOrderEvent {
  type: "order";
  orderId: string;
  tradingsymbol: string;
  status: string;
  statusMessage?: string | null;
  filledQuantity: number;
  quantity: number;
  averagePrice: number;
  transactionType: "BUY" | "SELL";
  timestamp: string;
}

export type LiveStreamEvent = LiveQuoteEvent | LiveOrderEvent | { type: "heartbeat"; timestamp: number };
