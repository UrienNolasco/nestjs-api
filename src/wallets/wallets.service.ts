import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Wallet } from './entities/wallet.entity';
import mongoose, { Model } from 'mongoose';
import { WalletAsset } from './entities/wallet-asset.entity';
import { AssetPresenter } from '../assets/asset.presenter'; // ajuste o caminho se necessário

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private WalletSchema: Model<Wallet>,
    @InjectModel(WalletAsset.name)
    private walletAssetSchema: Model<WalletAsset>,
    @InjectConnection() private connection: mongoose.Connection,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return this.WalletSchema.create(createWalletDto);
  }

  findAll() {
    return this.WalletSchema.find();
  }

  async findOne(id: string) {
    const wallet = await this.WalletSchema.findById(id).populate([
      {
        path: 'assets',
        populate: ['asset'],
      },
    ]);

    if (!wallet) return null;

    const walletObj = wallet.toObject();

    walletObj.assets = walletObj.assets.map((walletAsset) => ({
      ...walletAsset,
      asset: new AssetPresenter(walletAsset.asset).toJSON(),
    }));

    return walletObj;
  }

  async createWalletAsset(data: {
    walletId: string;
    assetId: string;
    shares: number;
  }) {
    const session = await this.connection.startSession();
    await session.startTransaction();
    try {
      const docs = await this.walletAssetSchema.create(
        [
          {
            wallet: data.walletId,
            asset: data.assetId,
            shares: data.shares,
          },
        ],
        { session },
      );
      const WalletAsset = docs[0];
      await this.WalletSchema.updateOne(
        { _id: data.walletId },
        {
          $push: { assets: WalletAsset._id },
        },
        { session },
      );
      await session.commitTransaction();
      return WalletAsset;
    } catch (e) {
      console.log(e);
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }
}