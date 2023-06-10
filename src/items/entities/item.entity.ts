import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // @Column()
  // @Field(() => Float)
  // quantity: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string; // g, ml, kg, tsp

  // stores
  // Relacion con los usuarios (En este caso es: Muchos items pertenecen a un mismo usuario)

  @ManyToOne( () => User, (user) => user.items, { nullable: false, lazy: true } ) //Lazy permite que la BD cargue los datos de user
  @Index('userId-Index')
  @Field( ()=> User )
  user: User;

}
