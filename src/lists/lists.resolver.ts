import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { ListsService } from './lists.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';

import { PaginationsArgs, SearchArgs } from 'src/common/dto/args';

import { User } from 'src/users/entities/user.entity';
import { List } from './entities/list.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Resolver(() => List)
@UseGuards( JwtAuthGuard )
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List)
  createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationsArgs,
    @Args() searchArgs: SearchArgs
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.findOne(id, user);
  }

  @Mutation(() => List)
  updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  removeList(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.remove(id, user);
  }
}
