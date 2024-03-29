import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildingEntity } from './entities/building.entity';
import { DeepPartial, Repository } from 'typeorm';
import { AssignApartmentToBuildingDto } from './dto/assign-apartment-to-building.dto';
import { ApartmentEntity } from 'src/apartment/entities/apartment.entity';
import { AddressEntity } from 'src/address/entities/address.entity';
import { AssignAddressToBuildingDto } from './dto/assign-address-to-building.dto';
import { CommonFacilityEntity } from 'src/common-facility/entities/common-facility.entity';
import { CommonFacilityToBuildingEntity } from 'src/common-facility-to-building/entities/common-facility-to-building.entity';
import { AssignFacilityToBuildingDto } from './dto/assign-facility-to-building.dto';

@Injectable()
export class BuildingService {

  constructor(
    @InjectRepository(BuildingEntity)
    private readonly buildingRepository: Repository<BuildingEntity>,
    @InjectRepository(ApartmentEntity)
    private readonly apartmentRepository: Repository<ApartmentEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(CommonFacilityEntity)
    private readonly commonFacilityRepository: Repository<CommonFacilityEntity>,
    @InjectRepository(CommonFacilityToBuildingEntity)
    private readonly commonFacilityToBuildingRepository: Repository<CommonFacilityToBuildingEntity>
  ) {}

  create(createBuildingDto: CreateBuildingDto) {
    const newBuilding = this.buildingRepository.create(createBuildingDto as DeepPartial<BuildingEntity>);
    return this.buildingRepository.save(newBuilding); 
  }

  async assignApartment(buildingId: number, assignApartmentDto: AssignApartmentToBuildingDto) {
    const { apartmentId } = assignApartmentDto;

    const building = await this.buildingRepository.findOne({ where: { id: buildingId } });
    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const apartment = await this.apartmentRepository.findOne({ where: { id: apartmentId } });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    apartment.building = building;

    await this.apartmentRepository.save(apartment);

    return apartment;
  }

  async assignAddress(buildingId: number, assignAddressDto: AssignAddressToBuildingDto) {
    const { addressId } = assignAddressDto;
  
    const building = await this.buildingRepository.findOne({ where: { id: buildingId } });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    
    const address = await this.addressRepository.findOne({ where: { id: addressId } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
  
    // Mise à jour de l'adresse avec l'ID du bâtiment
    address.building = building;

    // Enregistrer les modifications apportées à l'adresse
    await this.addressRepository.save(address);

    return address;
  }

  async assignFacilities(buildingId: number, assignFacilitiesDto: AssignFacilityToBuildingDto) {
    const { facilitiesId } = assignFacilitiesDto;

    const building = await this.buildingRepository.findOne({ where: { id: buildingId } });
    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const buildingFacilitiesList = [];

    for (const facilityId of facilitiesId) {
      const facilities = await this.commonFacilityRepository.findOne({ where: { id: facilityId } });
      if (!facilities) {
        throw new NotFoundException(`Facility with id ${facilityId} not found`);
      }

      const buildingFacilities = new CommonFacilityToBuildingEntity();
      buildingFacilities.building = building;
      buildingFacilities.commonFacility = facilities;

      buildingFacilities.commonFacility.name = facilities.name;

      if (facilities.isSecure) {
        buildingFacilities.lastInspection = new Date();
      } else if (buildingFacilities.lastInspection === null) {
        buildingFacilities.lastInspection = building.buildingCreationDate;
      } else {
        buildingFacilities.lastInspection = null; // Set a default value
      }

      await this.commonFacilityToBuildingRepository.save(buildingFacilities);

      buildingFacilitiesList.push(buildingFacilities.commonFacility);
    }

    return {
      building: building,
      facilities: buildingFacilitiesList
    };
  }

  async findOneByName(name: string) {
    return this.buildingRepository.findOne({ where: { name } });
  }
  
  findAll() {
    return this.buildingRepository.find({relations: ['apartments','commonFacilityToBuilding.commonFacility']});
  }

  findOne(id: number) {
    return this.buildingRepository.findOne({ where: { id }, relations: ['commonFacilityToBuilding.commonFacility'] });
  }

  async getBuildingStats(buildingId: number): Promise<any> {
    const building = await this.buildingRepository.findOne({ 
      where: { id: buildingId },
      relations: ['apartments', 'apartments.tenants']
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const totalApartments = building.apartments.length;
    const occupiedApartments = building.apartments.filter(apartment => apartment.tenants.length > 0).length;
    const totalTenants = building.apartments.reduce((acc, apartment) => acc + apartment.tenants.length, 0);
    const singleOccupancyApartments = building.apartments.filter(apartment => apartment.tenants.length === 1).length;
    const overOccupancyApartments = building.apartments.filter(apartment => apartment.tenants.length > 1).length;

    const occupancyRate = totalApartments === 0 ? 0 : (occupiedApartments / totalApartments) * 100;

    return {
      building,
      stats: {
        totalApartments,
        occupancyRate,
        totalTenants,
        singleOccupancyApartments,
        overOccupancyApartments
      }
    };
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto) {
    const building = await this.buildingRepository.findOne({ where: { id } });
    Object.assign(building, updateBuildingDto);
    return this.buildingRepository.save(building);
  }

  remove(id: number) {
    return this.buildingRepository.delete(id);
  }
}
