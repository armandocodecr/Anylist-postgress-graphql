import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';

import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

import { SignUpInput } from 'src/auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {

  //Sistema de logs para tener un mejor control de los errores en consola
  private logger: Logger = new Logger('UserService')

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ){}

  async create( signupInput: SignUpInput ): Promise<User> {
    
    try {
      
      const newUser = this.usersRepository.create( {
        ...signupInput,
        password: bcrypt.hashSync( signupInput.password, 10 )
      } )

      return await this.usersRepository.save( newUser )

    } catch (error) {
      this.handleDBErrors( error )
    }

  }

  async findAll( roles: ValidRoles[] ): Promise<User[]> {

    if( roles.length === 0 ) return this.usersRepository.find({
      //ToDo: NO es necesario porque tenemos lazy en la propiedad lastUpdatedBy
      // relations: {
      //   lastUpdtedBy: true //Indicamos que las relaciones con este campo también la cargue
      // }
    })

    return this.usersRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany()

  }

  async findOneByEmail(email: string): Promise<User> {
    
    try {
      return await this.usersRepository.findOneByOrFail({ email })
    } catch (error) {
      throw new NotFoundException(`${email} not found`)
    }

  }

  async findOneById(id: string): Promise<User> {
    
    try {
      return await this.usersRepository.findOneByOrFail({ id })
    } catch (error) {
      throw new NotFoundException(`${id} not found`)
    }

  }

  async block(id: string, adminUser: User): Promise<User> {
    
    const userToBlock = await this.findOneById( id )
    userToBlock.isActive = false;
    userToBlock.lastUpdtedBy = adminUser

    return this.usersRepository.save(userToBlock)

  }

  async update(
    id: string, 
    updateUserInput: UpdateUserInput,
    updatedBy: User
    ): Promise<User> {

    try {

      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id
      })

      user.lastUpdtedBy = updatedBy

      return await this.usersRepository.save( user )
      
    } catch (error) {
      this.handleDBErrors( error )
    }

  }

  private handleDBErrors( error: any ): never {

    if( error.code === '23505' ){
      throw new BadRequestException(error.detail.replace('Key', ''))
    }

    if( error.code === 'error-001' ){
      throw new BadRequestException(error.detail.replace('Key', ''))
    }
    
    this.logger.error( error )

    throw new InternalServerErrorException('Please check server logs')

  }

}
