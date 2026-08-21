import { z } from "zod";

export const PlaceOrderSchema = z
  .object({
    exchange: z.enum(["NSE", "BSE"], {
      required_error: "Exchange is required (NSE or BSE)",
    }),
    tradingsymbol: z
      .string({
        required_error: "Trading symbol is required",
      })
      .min(1, "Trading symbol cannot be empty")
      .max(30, "Trading symbol is too long")
      .transform((val) => val.trim().toUpperCase()),
    transactionType: z.enum(["BUY", "SELL"], {
      required_error: "Transaction type must be BUY or SELL",
    }),
    quantity: z
      .number({
        required_error: "Quantity is required",
      })
      .int("Quantity must be an integer")
      .positive("Quantity must be a positive number")
      .max(100000, "Quantity exceeds safety limit (100,000)"),
    orderType: z.enum(["MARKET", "LIMIT"], {
      required_error: "Order type must be MARKET or LIMIT",
    }),
    product: z.enum(["CNC", "MIS"], {
      required_error: "Product must be CNC (Delivery) or MIS (Intraday)",
    }),
    price: z
      .number()
      .positive("Price must be greater than 0")
      .optional()
      .nullable(),
    triggerPrice: z
      .number()
      .positive("Trigger price must be greater than 0")
      .optional()
      .nullable(),
    validity: z.enum(["DAY", "IOC"]).default("DAY"),
    variety: z.enum(["regular"]).default("regular"),
  })
  .refine(
    (data) => {
      if (data.orderType === "LIMIT") {
        return typeof data.price === "number" && data.price > 0;
      }
      return true;
    },
    {
      message: "Price is required and must be greater than 0 for LIMIT orders",
      path: ["price"],
    }
  );

export type ValidatedPlaceOrder = z.infer<typeof PlaceOrderSchema>;

export const CancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  variety: z.string().default("regular"),
});

export const QuotesQuerySchema = z.object({
  symbols: z
    .string()
    .min(1, "Symbols parameter is required")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0)
    )
    .refine((arr) => arr.length <= 25, {
      message: "Maximum 25 symbols can be requested at once",
    }),
});

export const HistoricalDataSchema = z.object({
  instrumentToken: z.coerce.number().positive("Instrument token must be positive"),
  interval: z.enum(["minute", "3minute", "5minute", "15minute", "30minute", "60minute", "day"]).default("day"),
  from: z.string().min(10, "From date required (YYYY-MM-DD)"),
  to: z.string().min(10, "To date required (YYYY-MM-DD)"),
});
