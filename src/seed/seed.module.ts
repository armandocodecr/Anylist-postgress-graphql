import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedResolver } from './seed.resolver';

import { SeedService } from './seed.service';

import { UsersModule } from 'src/users/users.module';
import { ItemsModule } from 'src/items/items.module';
import { ListItemModule } from 'src/list-item/list-item.module';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [
    ConfigModule,
    ItemsModule,
    ListItemModule,
    ListsModule,
    UsersModule,
  ]
})
export class SeedModule {}
