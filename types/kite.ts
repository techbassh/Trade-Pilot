// Raw Kite Connect v3 API Types

export interface KiteApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  error_type?: string;
  message?: string;
}

export interface KiteProfile {
  user_id: string;
  user_name: string;
  user_shortname: string;
  avatar_url?: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
  api_key?: string;
  access_token?: string;
  public_token?: string;
  refresh_token?: string;
  login_time?: string;
}

export interface KiteHolding {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  isin: string;
  product: string;
  price: number;
  quantity: number;
  used_quantity: number;
  t1_quantity: number;
  realised_quantity: number;
  authorised_quantity: number;
  opening_quantity: number;
  collateral_quantity: number;
  collateral_type: string;
  discrepancy: boolean;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
}

export interface KitePosition {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  product: "CNC" | "MIS" | "NRML";
  quantity: number;
  overnight_quantity: number;
  multiplier: number;
  average_price: number;
  close_price: number;
  last_price: number;
  value: number;
  pnl: number;
  m2m: number;
  unrealised: number;
  realised: number;
  buy_quantity: number;
  buy_price: number;
  buy_value: number;
  buy_m2m: number;
  sell_quantity: number;
  sell_price: number;
  sell_value: number;
  sell_m2m: number;
  day_buy_quantity: number;
  day_buy_price: number;
  day_buy_value: number;
  day_sell_quantity: number;
  day_sell_price: number;
  day_sell_value: number;
}

export interface KitePositionsResponse {
  net: KitePosition[];
  day: KitePosition[];
}

export interface KiteMarginSegment {
  enabled: boolean;
  net: number;
  available: {
    adhoc_margin: number;
    cash: number;
    collateral: number;
    intraday_payin: number;
    live_balance: number;
    opening_balance: number;
  };
  utilised: {
    debits: number;
    exposure: number;
    m2m_realised: number;
    m2m_unrealised: number;
    option_premium: number;
    pnl: number;
    span: number;
    holding_sales: number;
    turnover: number;
    liquid_collateral: number;
    stock_collateral: number;
    delivery: number;
  };
}

export interface KiteMarginsResponse {
  equity?: KiteMarginSegment;
  commodity?: KiteMarginSegment;
}

export interface KiteOrder {
  order_id: string;
  parent_order_id: string | null;
  exchange_order_id: string | null;
  placed_by: string;
  variety: "regular" | "amo" | "co" | "iceberg" | "auction";
  status: "COMPLETE" | "REJECTED" | "CANCELLED" | "OPEN" | "TRIGGER PENDING" | "PUT ORDER REQ RECEIVED";
  status_message: string | null;
  status_message_raw?: string | null;
  order_timestamp: string;
  exchange_timestamp: string | null;
  exchange_update_timestamp: string | null;
  checksum: string;
  tradingsymbol: string;
  exchange: "NSE" | "BSE" | "NFO" | "CDS" | "MCX";
  instrument_token: number;
  transaction_type: "BUY" | "SELL";
  order_type: "MARKET" | "LIMIT" | "SL" | "SL-M";
  product: "CNC" | "MIS" | "NRML";
  validity: "DAY" | "IOC" | "TTL";
  validity_ttl: number;
  price: number;
  trigger_price: number;
  average_price: number;
  quantity: number;
  filled_quantity: number;
  pending_quantity: number;
  cancelled_quantity: number;
  market_protection: number;
  meta: Record<string, any>;
  tag: string | null;
  guid: string;
}

export interface KiteQuoteDepthItem {
  price: number;
  quantity: number;
  orders: number;
}

export interface KiteQuote {
  instrument_token: number;
  timestamp: string;
  last_price: number;
  last_quantity: number;
  last_trade_time: string;
  average_price: number;
  volume: number;
  buy_quantity: number;
  sell_quantity: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  net_change: number;
  lower_circuit_limit?: number;
  upper_circuit_limit?: number;
  depth?: {
    buy: KiteQuoteDepthItem[];
    sell: KiteQuoteDepthItem[];
  };
}

export type KiteQuotesMap = Record<string, KiteQuote>;

export type KiteCandle = [
  string, // date/timestamp ISO
  number, // open
  number, // high
  number, // low
  number, // close
  number, // volume
  number? // open interest
];

export interface KiteHistoricalDataResponse {
  candles: KiteCandle[];
}
