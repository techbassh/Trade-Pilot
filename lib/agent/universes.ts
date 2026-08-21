// Universe Registry for Stock Scanner (NIFTY 50, NIFTY NEXT 50, NIFTY 100, NIFTY 500)

export interface UniverseStock {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
  instrumentToken: number;
  sector: string;
  basePrice: number;
  marketCapCategory: "LARGE_CAP" | "MID_CAP" | "SMALL_CAP";
}

export const NIFTY_50_STOCKS: UniverseStock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE", instrumentToken: 738561, sector: "Energy / Oil & Gas", basePrice: 2880.5, marketCapCategory: "LARGE_CAP" },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd", exchange: "NSE", instrumentToken: 2953217, sector: "Information Technology", basePrice: 4250.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", exchange: "NSE", instrumentToken: 341249, sector: "Financial Services", basePrice: 1640.2, marketCapCategory: "LARGE_CAP" },
  { symbol: "INFY", name: "Infosys Ltd", exchange: "NSE", instrumentToken: 408065, sector: "Information Technology", basePrice: 1860.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", exchange: "NSE", instrumentToken: 1270529, sector: "Financial Services", basePrice: 1195.4, marketCapCategory: "LARGE_CAP" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", exchange: "NSE", instrumentToken: 2714625, sector: "Telecommunication", basePrice: 1480.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "SBIN", name: "State Bank of India", exchange: "NSE", instrumentToken: 779521, sector: "Financial Services", basePrice: 825.6, marketCapCategory: "LARGE_CAP" },
  { symbol: "LICI", name: "Life Insurance Corporation", exchange: "NSE", instrumentToken: 5215745, sector: "Financial Services", basePrice: 1040.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ITC", name: "ITC Ltd", exchange: "NSE", instrumentToken: 424961, sector: "Consumer Goods", basePrice: 495.2, marketCapCategory: "LARGE_CAP" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", exchange: "NSE", instrumentToken: 356865, sector: "Consumer Goods", basePrice: 2680.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "LT", name: "Larsen & Toubro Ltd", exchange: "NSE", instrumentToken: 2939649, sector: "Construction / Infra", basePrice: 3620.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", exchange: "NSE", instrumentToken: 884737, sector: "Automobile", basePrice: 980.5, marketCapCategory: "LARGE_CAP" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries", exchange: "NSE", instrumentToken: 857857, sector: "Healthcare / Pharma", basePrice: 1720.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", exchange: "NSE", instrumentToken: 81153, sector: "Financial Services", basePrice: 7150.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", exchange: "NSE", instrumentToken: 2815745, sector: "Automobile", basePrice: 12450.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", exchange: "NSE", instrumentToken: 1510401, sector: "Financial Services", basePrice: 1180.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", exchange: "NSE", instrumentToken: 492033, sector: "Financial Services", basePrice: 1790.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TITAN", name: "Titan Company Ltd", exchange: "NSE", instrumentToken: 897281, sector: "Consumer Goods", basePrice: 3540.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", exchange: "NSE", instrumentToken: 633601, sector: "Energy / Oil & Gas", basePrice: 325.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd", exchange: "NSE", instrumentToken: 6401, sector: "Metals & Mining", basePrice: 3010.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "NTPC", name: "NTPC Ltd", exchange: "NSE", instrumentToken: 2977281, sector: "Utilities / Power", basePrice: 410.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "POWERGRID", name: "Power Grid Corp of India", exchange: "NSE", instrumentToken: 3812865, sector: "Utilities / Power", basePrice: 335.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", exchange: "NSE", instrumentToken: 895745, sector: "Metals & Mining", basePrice: 155.2, marketCapCategory: "LARGE_CAP" },
  { symbol: "COALINDIA", name: "Coal India Ltd", exchange: "NSE", instrumentToken: 5215746, sector: "Metals & Mining", basePrice: 515.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd", exchange: "NSE", instrumentToken: 519937, sector: "Automobile", basePrice: 2780.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "WIPRO", name: "Wipro Ltd", exchange: "NSE", instrumentToken: 969473, sector: "Information Technology", basePrice: 540.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", exchange: "NSE", instrumentToken: 1850625, sector: "Information Technology", basePrice: 1680.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", exchange: "NSE", instrumentToken: 4268801, sector: "Financial Services", basePrice: 1740.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", exchange: "NSE", instrumentToken: 60417, sector: "Consumer Goods", basePrice: 2980.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd", exchange: "NSE", instrumentToken: 4598529, sector: "Consumer Goods", basePrice: 2450.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd", exchange: "NSE", instrumentToken: 2952193, sector: "Cement / Building", basePrice: 11200.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", exchange: "NSE", instrumentToken: 3001089, sector: "Metals & Mining", basePrice: 935.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "GRASIM", name: "Grasim Industries Ltd", exchange: "NSE", instrumentToken: 315393, sector: "Cement / Building", basePrice: 2650.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd", exchange: "NSE", instrumentToken: 3861249, sector: "Infrastructure", basePrice: 1460.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", exchange: "NSE", instrumentToken: 3465729, sector: "Information Technology", basePrice: 1540.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd", exchange: "NSE", instrumentToken: 348929, sector: "Metals & Mining", basePrice: 685.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "CIPLA", name: "Cipla Ltd", exchange: "NSE", instrumentToken: 177665, sector: "Healthcare / Pharma", basePrice: 1560.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", exchange: "NSE", instrumentToken: 225537, sector: "Healthcare / Pharma", basePrice: 6650.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise", exchange: "NSE", instrumentToken: 40193, sector: "Healthcare", basePrice: 6720.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd", exchange: "NSE", instrumentToken: 232961, sector: "Automobile", basePrice: 4890.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd", exchange: "NSE", instrumentToken: 2800641, sector: "Healthcare / Pharma", basePrice: 4890.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BPCL", name: "Bharat Petroleum Corp Ltd", exchange: "NSE", instrumentToken: 134657, sector: "Energy / Oil & Gas", basePrice: 355.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd", exchange: "NSE", instrumentToken: 140033, sector: "Consumer Goods", basePrice: 5620.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd", exchange: "NSE", instrumentToken: 878593, sector: "Consumer Goods", basePrice: 1180.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", exchange: "NSE", instrumentToken: 345089, sector: "Automobile", basePrice: 5350.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", exchange: "NSE", instrumentToken: 4267265, sector: "Automobile", basePrice: 10400.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd", exchange: "NSE", instrumentToken: 806401, sector: "Financial Services", basePrice: 3120.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TRENT", name: "Trent Ltd", exchange: "NSE", instrumentToken: 5013761, sector: "Consumer Retail", basePrice: 6850.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BEL", name: "Bharat Electronics Ltd", exchange: "NSE", instrumentToken: 98049, sector: "Capital Goods / Defense", basePrice: 305.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", exchange: "NSE", instrumentToken: 1346049, sector: "Financial Services", basePrice: 1420.0, marketCapCategory: "LARGE_CAP" },
];

export const NIFTY_NEXT_50_STOCKS: UniverseStock[] = [
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", exchange: "NSE", instrumentToken: 589569, sector: "Defense / Aerospace", basePrice: 4720.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ZOMATO", name: "Zomato Ltd", exchange: "NSE", instrumentToken: 5215747, sector: "Consumer Tech", basePrice: 260.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "VBL", name: "Varun Beverages Ltd", exchange: "NSE", instrumentToken: 3660545, sector: "Consumer Goods", basePrice: 610.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "JIOFIN", name: "Jio Financial Services", exchange: "NSE", instrumentToken: 5215748, sector: "Financial Services", basePrice: 325.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "VEDL", name: "Vedanta Ltd", exchange: "NSE", instrumentToken: 784129, sector: "Metals & Mining", basePrice: 460.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "SIEMENS", name: "Siemens Ltd", exchange: "NSE", instrumentToken: 811777, sector: "Capital Goods", basePrice: 6750.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "ABB", name: "ABB India Ltd", exchange: "NSE", instrumentToken: 2561, sector: "Capital Goods", basePrice: 7850.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "DLF", name: "DLF Ltd", exchange: "NSE", instrumentToken: 377857, sector: "Realty", basePrice: 845.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "CHOLAFIN", name: "Cholamandalam Investment", exchange: "NSE", instrumentToken: 175361, sector: "Financial Services", basePrice: 1490.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "PFC", name: "Power Finance Corporation", exchange: "NSE", instrumentToken: 3677697, sector: "Financial Services", basePrice: 485.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "RECLTD", name: "REC Ltd", exchange: "NSE", instrumentToken: 3930881, sector: "Financial Services", basePrice: 535.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "GAIL", name: "GAIL India Ltd", exchange: "NSE", instrumentToken: 1207553, sector: "Utilities / Gas", basePrice: 225.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "TATAPOWER", name: "Tata Power Co Ltd", exchange: "NSE", instrumentToken: 877057, sector: "Utilities / Power", basePrice: 425.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "IOC", name: "Indian Oil Corporation", exchange: "NSE", instrumentToken: 415745, sector: "Energy / Oil & Gas", basePrice: 175.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "BANKBARODA", name: "Bank of Baroda", exchange: "NSE", instrumentToken: 1195009, sector: "Financial Services", basePrice: 245.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "PNB", name: "Punjab National Bank", exchange: "NSE", instrumentToken: 2730497, sector: "Financial Services", basePrice: 110.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "HAVELLS", name: "Havells India Ltd", exchange: "NSE", instrumentToken: 2514689, sector: "Consumer Durables", basePrice: 1860.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "POLYCAB", name: "Polycab India Ltd", exchange: "NSE", instrumentToken: 2418433, sector: "Capital Goods", basePrice: 6520.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "CANBK", name: "Canara Bank", exchange: "NSE", instrumentToken: 1163009, sector: "Financial Services", basePrice: 105.0, marketCapCategory: "LARGE_CAP" },
  { symbol: "NAUKRI", name: "Info Edge India Ltd", exchange: "NSE", instrumentToken: 3506433, sector: "Consumer Tech", basePrice: 7420.0, marketCapCategory: "LARGE_CAP" },
];

export const NIFTY_100_STOCKS: UniverseStock[] = [
  ...NIFTY_50_STOCKS,
  ...NIFTY_NEXT_50_STOCKS,
];

export const NIFTY_500_STOCKS: UniverseStock[] = [
  ...NIFTY_100_STOCKS,
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd", exchange: "NSE", instrumentToken: 4708097, sector: "Information Technology", basePrice: 5120.0, marketCapCategory: "MID_CAP" },
  { symbol: "KPITTECH", name: "KPIT Technologies Ltd", exchange: "NSE", instrumentToken: 5215749, sector: "Information Technology", basePrice: 1680.0, marketCapCategory: "MID_CAP" },
  { symbol: "COFORGE", name: "Coforge Ltd", exchange: "NSE", instrumentToken: 2933761, sector: "Information Technology", basePrice: 7250.0, marketCapCategory: "MID_CAP" },
  { symbol: "MPHASIS", name: "Mphasis Ltd", exchange: "NSE", instrumentToken: 54273, sector: "Information Technology", basePrice: 2980.0, marketCapCategory: "MID_CAP" },
  { symbol: "DIXON", name: "Dixon Technologies Ltd", exchange: "NSE", instrumentToken: 5215750, sector: "Electronics", basePrice: 13200.0, marketCapCategory: "MID_CAP" },
  { symbol: "KAYNES", name: "Kaynes Technology Ltd", exchange: "NSE", instrumentToken: 5215751, sector: "Electronics", basePrice: 5450.0, marketCapCategory: "MID_CAP" },
  { symbol: "ASTRAL", name: "Astral Ltd", exchange: "NSE", instrumentToken: 3675137, sector: "Building Materials", basePrice: 1890.0, marketCapCategory: "MID_CAP" },
  { symbol: "SUPREMEIND", name: "Supreme Industries Ltd", exchange: "NSE", instrumentToken: 864513, sector: "Building Materials", basePrice: 5150.0, marketCapCategory: "MID_CAP" },
  { symbol: "FEDERALBNK", name: "Federal Bank Ltd", exchange: "NSE", instrumentToken: 2634241, sector: "Financial Services", basePrice: 195.0, marketCapCategory: "MID_CAP" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd", exchange: "NSE", instrumentToken: 2863105, sector: "Financial Services", basePrice: 72.5, marketCapCategory: "MID_CAP" },
  { symbol: "SUZLON", name: "Suzlon Energy Ltd", exchange: "NSE", instrumentToken: 3175169, sector: "Renewable Energy", basePrice: 78.5, marketCapCategory: "MID_CAP" },
  { symbol: "IREDA", name: "Indian Renewable Energy Agency", exchange: "NSE", instrumentToken: 5215752, sector: "Financial Services", basePrice: 235.0, marketCapCategory: "MID_CAP" },
  { symbol: "HUDCO", name: "Housing & Urban Dev Corp", exchange: "NSE", instrumentToken: 5215753, sector: "Financial Services", basePrice: 280.0, marketCapCategory: "MID_CAP" },
  { symbol: "MAZDOCK", name: "Mazagon Dock Shipbuilders", exchange: "NSE", instrumentToken: 5215754, sector: "Defense / Shipbuilding", basePrice: 4350.0, marketCapCategory: "MID_CAP" },
  { symbol: "COCHINSHIP", name: "Cochin Shipyard Ltd", exchange: "NSE", instrumentToken: 5215755, sector: "Defense / Shipbuilding", basePrice: 1780.0, marketCapCategory: "MID_CAP" },
  { symbol: "BSE", name: "BSE Ltd", exchange: "NSE", instrumentToken: 5215756, sector: "Capital Markets", basePrice: 3850.0, marketCapCategory: "MID_CAP" },
  { symbol: "MCX", name: "Multi Commodity Exchange", exchange: "NSE", instrumentToken: 794369, sector: "Capital Markets", basePrice: 6240.0, marketCapCategory: "MID_CAP" },
  { symbol: "CDSL", name: "Central Depository Services", exchange: "NSE", instrumentToken: 5215757, sector: "Capital Markets", basePrice: 1480.0, marketCapCategory: "MID_CAP" },
  { symbol: "PRESTIGE", name: "Prestige Estates Projects", exchange: "NSE", instrumentToken: 4706561, sector: "Realty", basePrice: 1740.0, marketCapCategory: "MID_CAP" },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty Ltd", exchange: "NSE", instrumentToken: 5185537, sector: "Realty", basePrice: 1980.0, marketCapCategory: "MID_CAP" },
];

export function getUniverseConstituents(universe = "NIFTY_500"): UniverseStock[] {
  const norm = universe.trim().toUpperCase().replace(/[\s-]/g, "_");
  if (norm.includes("500")) return NIFTY_500_STOCKS;
  if (norm.includes("NEXT")) return NIFTY_NEXT_50_STOCKS;
  if (norm.includes("100") || norm.includes("200")) return NIFTY_100_STOCKS;
  if (norm.includes("50")) return NIFTY_50_STOCKS;
  return NIFTY_500_STOCKS;
}
