import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationsArgs, SearchArgs } from 'src/common/dto/args';

import { User } from 'src/users/entities/user.entity';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository( Item )
    private readonly itemsRepository: Repository<Item>
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user })
    return await this.itemsRepository.save( newItem )
  }

  async findAll( 
    user: User, 
    paginationArgs: PaginationsArgs, 
    searchArgs: SearchArgs 
  ): Promise<Item[]> {
    
    const { limit, offset } = paginationArgs
    const { search } = searchArgs

    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .take( limit )
      .skip( offset )
      .where(`"userId" = :userId`, { userId: user.id })

    if( search ) queryBuilder.andWhere('LOWER(name) like :name', { name: `%${ search.toLocaleLowerCase() }%` })

    return queryBuilder.getMany()
    
    // return await this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   "where": {
    //     user: {
    //       id: user.id
    //     },
    //     name: Like(`%${search}%`)
    //   }
    // })
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ 
      id,
      user: {
        id: user.id
      } 
    });

    if( !item ) throw new NotFoundException(`Item with id ${id} not found`)

    // item.user = user

    return item
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {

    await this.findOne( id, user )
    const item = await this.itemsRepository.preload( updateItemInput ) //Busca ppor id y a la vez carga la identidad

    if( !item ) throw new NotFoundException(`Item with id ${id} not found`)

    return this.itemsRepository.save( item );
  }

  async remove(id: string, user: User): Promise<Item> {
    //ToDo: soft delete, integrad referencial
    const item = await this.findOne( id, user )
    await this.itemsRepository.remove( item )

    return { ...item, id }
  }

  async itemCountByUser( user: User ): Promise<Number> {

    return this.itemsRepository.count({
      "where": {
        user: {
          id: user.id
        }
      }
    })

  }
}

