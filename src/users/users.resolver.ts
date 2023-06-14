import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { ItemsService } from 'src/items/items.service';
import { ListsService } from 'src/lists/lists.service';

import { User } from './entities/user.entity';
import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';

import { ValidRolesArgs } from './dto/args/roles.arg';
import { PaginationsArgs, SearchArgs } from 'src/common/dto/args';

import { UpdateUserInput } from './dto/update-user.input';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Resolver(() => User)
@UseGuards( JwtAuthGuard )
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listService: ListsService
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User //Indicamos que solo los usuarios con role de admin y superUser 
                                                                      // pueden hacer dicha petición
  ): Promise<User[]> {

    return this.usersService.findAll( validRoles.roles );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    
    return this.usersService.findOneById( id )

  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField( ()=> Int, { name: 'itemCount' } )
  async itemCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User //Nos permite tener acceso a los datos del padre
  ): Promise<Number> {
    return this.itemsService.itemCountByUser( user );
  }

  @ResolveField( ()=> [Item], { name: 'items' } )
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User, //Nos permite tener acceso a los datos del padre
    @Args() paginationArgs: PaginationsArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAll( user, paginationArgs, searchArgs );
  }

  @ResolveField( ()=> [List], { name: 'lists' } )
  async getLitsByUser(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User, //Nos permite tener acceso a los datos del padre
    @Args() paginationArgs: PaginationsArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listService.findAll( user, paginationArgs, searchArgs );
  }

  @ResolveField( ()=> Int, { name: 'listCount' } )
  async listCount(
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Parent() user: User //Nos permite tener acceso a los datos del padre
  ): Promise<Number> {
    return this.listService.listCountByUser( user );
  }

}
