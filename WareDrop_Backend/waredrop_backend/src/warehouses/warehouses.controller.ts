import {Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {Request} from "express";
import JwtDecoder from "../auth/jwt.decoder";
import {
    AddWarehouseDto,
    WarehouseCreateInput,
    WarehouseDto,
    WarehousesService,
    WarehouseUpdateInput
} from "./warehouses.service";
import {PermissionGuard} from "../auth/guards/permission.guard";
import {RequiredPermission} from "../auth/guards/permission.decorator";

@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly jwt: JwtDecoder,
                private readonly service: WarehousesService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard,PermissionGuard)
    @RequiredPermission([{permissionName: 'All'}])
    addNew(@Body() createInput: WarehouseCreateInput){
        return this.service.addWarehouse(createInput);
    }
    @Get()
    @UseGuards(JwtAuthGuard,PermissionGuard)
    @RequiredPermission([{permissionName: 'All'}])
    async getWarehouses(){
        return this.service.getWarehouses();
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard,PermissionGuard)
    @RequiredPermission([{permissionName: 'All'}])
    async getWarehouseById(@Param('id') id: string){
        return this.service.getWarehouseById(id);
    }

    @Get('/user')
    @UseGuards(JwtAuthGuard)
    async getWarehousesByUser(@Req() req: Request){
        const decodedJwt = this.jwt.decodeToken(req);
        return this.service.getWarehousesByUser({userId: decodedJwt.sub.id, userEmail: decodedJwt.sub.email});
    }

    @Get('/items/:id')
    async getItemsInWarehouse(@Param('id') warehouseString: string){
        const warehouseId: WarehouseDto = {warehouseId: parseInt(warehouseString)};
        return this.service.getItemsInWarehouse(warehouseId);
    }

    @Patch()
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @RequiredPermission([{permissionName: 'All'}])
    async updateWarehouse(@Body() warehouseDto: WarehouseUpdateInput){
        return this.service.updateWarehouse(warehouseDto);
    }

    @Patch('/assignUser')
    @UseGuards(JwtAuthGuard,PermissionGuard)
    @RequiredPermission([{permissionName: 'All'}])
    async addToUser(@Body() addInput: AddWarehouseDto){
        return this.service.addWarehouseToUser(addInput);
    }
}
