import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthRespponse } from './types/auth-response.type';
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    private getJwt( userId: string ){
        return this.jwtService.sign({ id: userId })
    }

    async signup( signupInput: SignUpInput ): Promise<AuthRespponse> {

        const user = await this.userService.create( signupInput )

        const token = this.getJwt( user.id )

        return { token, user }

    }

    async login( { email, password }: LoginInput ): Promise<AuthRespponse> {

        const user = await this.userService.findOneByEmail( email )
        
        if( !bcrypt.compareSync( password, user.password )) throw new BadRequestException('Email / Password do not match')
        
        const token = this.getJwt( user.id )
        return {
            token,
            user
        }

    }

    async validateUser( id: string ): Promise<User> {

        const user = await this.userService.findOneById(id)

        if( !user.isActive ) throw new UnauthorizedException(`User is inactive, talk with an admin`)

        delete user.password

        return user

    }

    revaliteToken( user: User ): AuthRespponse{

        const token = this.getJwt( user.id )

        return { token, user }

    }

}
