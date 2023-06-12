import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SeedResolver } from './seed.resolver';

import { SeedService } from './seed.service';

import { UsersModule } from 'src/users/users.module';
import { ItemsModule } from 'src/items/items.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [
    ConfigModule,
    UsersModule,
    ItemsModule
  ]
})
export class SeedModule {}
