import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';

import { ItemsService } from '../items/items.service';
import { ListItemService } from 'src/list-item/list-item.service';
import { ListsService } from 'src/lists/lists.service';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class SeedService {

    private isProd: boolean

    constructor(
        private readonly configService: ConfigService,
        
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly userRepository:  Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemRepository:  Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository:  Repository<List>,

        private readonly userService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listItemService: ListItemService,
        private readonly listService: ListsService,
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

        //Crear listas

        const list = await this.loadList( user )

        //Crear listItems
        const items = await this.itemsService.findAll(user, { limit: 15, offset: 0 }, {})
        await this.loadListItems( list, items )

        return true
    }

    async deleteDatabase() {

        await this.listItemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

        await this.listRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute()

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
            users.push( await this.userService.create( user ) )
        }

        return users[0]

    }

    async loadItems(user: User): Promise<void> {
        
        const items = []

        for (const item of SEED_ITEMS){
            items.push( await this.itemsService.create( item, user ) )
        }

        return items[0]

    }

    async loadList( user: User ): Promise<List> {

        const lists = []

        for (const list of SEED_LISTS) {
            lists.push( await this.listService.create( list, user ) )
        }

        return lists[0]

    }

    async loadListItems( list: List, items: Item[] ) {

        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round( Math.random() * 10 ),
                completed: Math.round( Math.random() * 1 ) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            })
        }
    }

}
