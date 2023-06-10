import { ExecutionContext, ForbiddenException, InternalServerErrorException, createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ValidRoles } from "../enums/valid-roles.enum";
import { User } from "src/users/entities/user.entity";


export const CurrentUser = createParamDecorator(
    ( roles: ValidRoles[] = [], context: ExecutionContext ) => {

        const ctx = GqlExecutionContext.create( context )
        const user: User = ctx.getContext().req.user

        if( !user ) throw new InternalServerErrorException(`No user inside the request . make sure taht we used the AuthGuard`)

        if( roles.length === 0 ) return user;

        for( const rol of user.roles ){
            if( roles.includes( rol as ValidRoles )) return user
        }

        throw new ForbiddenException(
            `User ${ user.fullName } need a valid role [${ roles }]`
        ) //Este error es porque el usuario a pesar de estar autenticado no tiene autorizacion

})