import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthRespponse } from './types/auth-response.type';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(() => AuthResolver)
export class AuthResolver {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation(() => AuthRespponse, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignUpInput
  ): Promise<AuthRespponse> {
    return this.authService.signup( signupInput )
  }

  @Mutation(() => AuthRespponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<AuthRespponse> {
    return this.authService.login( loginInput )
  }

  @Query(() => AuthRespponse, { name: 'revalite' })
  @UseGuards( JwtAuthGuard )
  revaliteToken(
    @CurrentUser(/**[ ValidRoles.admin ] */) user: User
  ): AuthRespponse {
    return this.authService.revaliteToken( user )
  }

}
