import { getPriceHash } from "@CFD-V2/services/redis";
import { assetSchema } from "@CFD-V2/validators/asset";
import { privateProcedure, router } from "@/src/trpc.js";

const listedAssets = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 4,
    imageUrl:
      "https://i.postimg.cc/TPh0K530/87496d50-2408-43e1-ad4c-78b47b448a6a.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 4,
    imageUrl:
      "https://i.postimg.cc/gcKhPkY2/3a8c9fe6-2a76-4ace-aa07-415d994de6f0.png",
  },
  {
    name: "Solana",
    symbol: "SOL",
    decimals: 4,
    imageUrl:
      "https://i.postimg.cc/9MhDvsK9/b2f0c70f-4fb2-4472-9fe7-480ad1592421.png",
  },
] as const;

export const assetRouter = router({
  getAll: privateProcedure
    .output(assetSchema.getAssetsOutput)
    .query(async () => {
      const assets = await Promise.all(
        listedAssets.map(async (asset) => {
          const redisKeyPair = `${asset.symbol}USDT`;
          const priceData = await getPriceHash(redisKeyPair);

          if (!priceData) {
            return {
              name: asset.name,
              symbol: asset.symbol,
              decimals: asset.decimals,
              imageUrl: asset.imageUrl,
              buyPrice: 0,
              sellPrice: 0,
            };
          }

          const buyPrice = Number(priceData.ask);
          const sellPrice = Number(priceData.bid);

          return {
            name: asset.name,
            symbol: asset.symbol,
            decimals: asset.decimals,
            imageUrl: asset.imageUrl,
            buyPrice: Number.isFinite(buyPrice) ? buyPrice : 0,
            sellPrice: Number.isFinite(sellPrice) ? sellPrice : 0,
          };
        }),
      );

      return { assets };
    }),
});
