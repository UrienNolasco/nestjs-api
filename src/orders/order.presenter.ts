import { AssetPresenter } from 'src/assets/asset.presenter';
import { Asset } from 'src/assets/entities/asset.entity';
import { Order } from 'src/orders/entities/order.entity';

export class OrderPresenter {
  constructor(private order: Order & { asset: Asset }) {}

  toJSON() {
    return {
      _id: this.order._id,
      asset: new AssetPresenter(this.order.asset).toJSON(),
      shares: this.order.shares,
      partial: this.order.partial,
      price: this.order.price,
      type: this.order.type,
      status: this.order.status,
    };
  }
}
