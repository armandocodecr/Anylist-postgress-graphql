import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_ITEMS, SEED_USERS } from './data/seed-data';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from 'src/users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean

    constructor(
        private readonly configService: ConfigService,
        
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly userRepository:  Repository<User>,

        private readonly userService: UsersService,

        private readonly itemsService: ItemsService
    ) {
        this.isProd = configService.get('STATE') === 'prod'
    }

    async executeSeed() {

        if( this.isProd ){
            throw new UnauthorizedException('We cannot run SEED on Prod')
        }
        //Limpiar la BD
        await this.deleteDatabase()

        //Crear usuarios
        const user = await this.loadUsers()

        //Crear items

        await this.loadItems(user)

        return true
    }

    async deleteDatabase() {

        await this.itemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

        await this.userRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()
    }

    async loadUsers(): Promise<User> {

        const users = []

        for (const user of SEED_USERS) {
            users.push( await this.userService.create(user) )
        }

        return users[0]

    }

    async loadItems(user: User): Promise<void> {
        
        const items = []

        for (const item of SEED_ITEMS){
            items.push( await this.itemsService.create(item, user) )
        }

        return items[0]

    }

}
