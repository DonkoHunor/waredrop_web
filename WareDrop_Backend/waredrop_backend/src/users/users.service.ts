import {Injectable,} from "@nestjs/common";
import {PrismaService} from "../database/prisma.service";
import {Prisma} from "@prisma/client"
import * as bcrypt from 'bcrypt'
import {IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";


export class CreateUserDto {
    @ApiProperty({
        description: 'The username of the new user',
        minLength: 3
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @ApiProperty({
        description: 'The email of the new user'
    })
    @IsEmail()
    @IsNotEmpty()
    userEmail: string

    @ApiProperty({
        description: 'The password of the new user',
        minLength: 6
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    userPassword: string
}

export class UserUpdateInput {
    @ApiProperty({
        description: 'The id of the user which will be updated'
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @ApiPropertyOptional({
        description: 'The updated name of the user',
        minLength: 3
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    userName?: string

    @ApiPropertyOptional({
        description: 'The updated email of the user',
    })
    @IsString()
    @IsOptional()
    userEmail?: string
}

export class UserDto{
    @ApiProperty({
        description: 'The id of a user'
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @ApiPropertyOptional({
        description: 'The email of a user'
    })
    @IsString()
    @IsOptional()
    userEmail?: string
}

@Injectable()
export class UsersService {
    constructor(private db: PrismaService) {}

    async createUser(createInput: CreateUserDto){
        const users = await this.db.users.findMany();
        const salt = await bcrypt.genSalt();
        createInput.userPassword = await bcrypt.hash(createInput.userPassword, salt);

        const result = await this.db.users.create({
                data: {
                    user_name: createInput.userName,
                    user_email: createInput.userEmail,
                    user_password: createInput.userPassword,
                }
            });

        if (users.length === 0) {
            await this.db.user_has_role.create({
                data: {
                    user_user_id: result.user_id,
                    role_role_id: 1,
                }
            })
        }

        return result;
    }

    async createWorker(createInput: CreateUserDto){
        const workerRole = await this.db.roles.findFirst({where: {role_name: "Worker"}})
        const salt = await bcrypt.genSalt();
        createInput.userPassword = await bcrypt.hash(createInput.userPassword, salt);
        const newUser =  await this.db.users.create({
            data: {
                user_name: createInput.userName,
                user_email: createInput.userEmail,
                user_password: createInput.userPassword,
            }
        });
        await this.db.user_has_role.create({
            data: {
                user_user_id: newUser.user_id,
                role_role_id: workerRole.role_id,
            }
        })

        return newUser;
    }

    async listUsers(user: UserDto){
        return this.db.users.findMany({
            where: {
                user_id: {
                    not: user.userId
                }
            },
            include: {
                user_has_role: {
                    select: {
                        roles: {
                            select: {
                                role_name: true,
                            }
                        }
                    }
                }
            }
        });
    }

    async findUserByEmail(email: string){
        return this.db.users.findFirst({
            where: {
                user_email: email
            }
        })
    }

    async findUserById(id: number) {
        return this.db.users.findUnique({
            where: {
                user_id: id
            }
        })
    }

    async updateUser(updateInput: UserUpdateInput){
        return this.db.users.update({
            data: {
                user_name: updateInput.userName,
                user_email: updateInput.userEmail,
            },
            where: {
                user_id: updateInput.userId
            }
        })
    }

    async deleteUser(deleteInput: UserDto){
        try {

            //If the user got any assigned roles, the relation will be deleted as well
            const hasRole = await this.db.user_has_role.findFirst({
                where: {
                    user_user_id: deleteInput.userId
                }
            })

            if (hasRole){
                await this.db.user_has_role.deleteMany({
                    where: {
                        user_user_id: deleteInput.userId
                    }
                })
            }

            //If the user got any warehouses, the relation will be deleted as well
            const assignedToWarehouse = await this.db.warehouses.findFirst({
                where: {
                    assigned_user_id: deleteInput.userId
                }
            })

            if(assignedToWarehouse){
                await this.db.warehouses.updateMany({
                    where: {
                        assigned_user_id: deleteInput.userId
                    },
                    data: {
                        assigned_user_id: null,
                    }
                })
            }

            await this.db.users.delete({
                where: {
                    user_id: deleteInput.userId,
                }
            });

            return {Massage: "User deleted"};
        }
        catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'){
                return {errorMassage: "User does not exist"};
            }
            else {
                throw e
            }
        }
    }

    async getUserName(user: UserDto){
        return this.db.users.findFirst({
            select: {
                user_name: true,
            },
            where: {
                user_id: user.userId,
            }
        })
    }
}