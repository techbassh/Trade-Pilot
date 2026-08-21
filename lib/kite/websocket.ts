// Kite Connect v3 WebSocket Binary Parser

export interface ParsedTick {
  instrumentToken: number;
  mode: "ltp" | "quote" | "full";
  lastPrice: number;
  lastQuantity?: number;
  averagePrice?: number;
  volume?: number;
  buyQuantity?: number;
  sellQuantity?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change?: number;
  changePercent?: number;
  timestamp: number;
}

export function parseBinaryTickerData(buffer: Buffer): ParsedTick[] {
  if (buffer.length < 2) return [];

  const ticks: ParsedTick[] = [];
  const numberOfPackets = buffer.readUInt16BE(0);
  let offset = 2;

  for (let i = 0; i < numberOfPackets; i++) {
    if (offset + 2 > buffer.length) break;

    const packetLength = buffer.readUInt16BE(offset);
    offset += 2;

    if (offset + packetLength > buffer.length) break;

    const packet = buffer.subarray(offset, offset + packetLength);
    offset += packetLength;

    if (packet.length === 8) {
      // LTP mode
      const instrumentToken = packet.readUInt32BE(0);
      const lastPrice = packet.readUInt32BE(4) / 100.0;

      ticks.push({
        instrumentToken,
        mode: "ltp",
        lastPrice,
        timestamp: Date.now(),
      });
    } else if (packet.length === 28 || packet.length === 32) {
      // Quote mode
      const instrumentToken = packet.readUInt32BE(0);
      const lastPrice = packet.readUInt32BE(4) / 100.0;
      const lastQuantity = packet.readUInt32BE(8);
      const averagePrice = packet.readUInt32BE(12) / 100.0;
      const volume = packet.readUInt32BE(16);
      const buyQuantity = packet.readUInt32BE(20);
      const sellQuantity = packet.readUInt32BE(24);

      let open = 0;
      let high = 0;
      let low = 0;
      let close = 0;

      if (packet.length >= 32) {
        // Includes OHLC (if extended quote)
        // In Kite v3, OHLC begins at index 28 for indices or 32 for full quote
      }

      ticks.push({
        instrumentToken,
        mode: "quote",
        lastPrice,
        lastQuantity,
        averagePrice,
        volume,
        buyQuantity,
        sellQuantity,
        timestamp: Date.now(),
      });
    } else if (packet.length === 184 || packet.length === 164) {
      // Full mode
      const instrumentToken = packet.readUInt32BE(0);
      const lastPrice = packet.readUInt32BE(4) / 100.0;
      const lastQuantity = packet.readUInt32BE(8);
      const averagePrice = packet.readUInt32BE(12) / 100.0;
      const volume = packet.readUInt32BE(16);
      const buyQuantity = packet.readUInt32BE(20);
      const sellQuantity = packet.readUInt32BE(24);
      const open = packet.readUInt32BE(28) / 100.0;
      const high = packet.readUInt32BE(32) / 100.0;
      const low = packet.readUInt32BE(36) / 100.0;
      const close = packet.readUInt32BE(40) / 100.0;

      const change = close > 0 ? lastPrice - close : 0;
      const changePercent = close > 0 ? (change / close) * 100 : 0;

      ticks.push({
        instrumentToken,
        mode: "full",
        lastPrice,
        lastQuantity,
        averagePrice,
        volume,
        buyQuantity,
        sellQuantity,
        ohlc: {
          open,
          high,
          low,
          close,
        },
        change,
        changePercent,
        timestamp: Date.now(),
      });
    }
  }

  return ticks;
}
