import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsModule } from './wallets/wallets.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AssetsModule,
    MongooseModule.forRoot(
      'mongodb://root:root@localhost:27017/nest?authSource=admin&directConnection=true',
    ),
    WalletsModule,
    OrdersModule,
  ],
})
export class AppModule {}
