import { join } from 'path';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [

    ConfigModule.forRoot(),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ AuthModule ],
      inject: [ JwtService ],
      useFactory: async(jwtService: JwtService ) => ({
          playground: false,
          plugins: [
            ApolloServerPluginLandingPageLocalDefault()
          ],
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          context({ req }) { // Este código deniega a los querys de la BD a usuarios con token no autenticado
            // const token = req.headers.authorization?.replace('Bearer ', '')
            // if( !token ) throw new Error('Token needed')

            // const payload = jwtService.decode( token )
            // if( !payload ) throw new Error('Token not valid')
          }
        })
    }),

    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   playground: false,
    //   plugins: [
    //     ApolloServerPluginLandingPageLocalDefault()
    //   ],
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // }),

      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        autoLoadEntities: true,
      }),
      
    ItemsModule,
      
    UsersModule,
      
    AuthModule,
      
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
