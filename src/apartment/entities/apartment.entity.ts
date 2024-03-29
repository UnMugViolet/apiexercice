import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BuildingEntity } from '../../building/entities/building.entity';
import { OptionEntity } from '../../option/entities/option.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { OwnerEntity } from '../../owner/entities/owner.entity';
import { ApartmentTypeEntity } from 'src/apartment-type/entities/apartment-type.entity';

@Entity('apartment')
export class ApartmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  doorNumber: string;

  @Column()
  floorArea: number;

  @Column()
  rent: number;

  @ManyToOne(() => BuildingEntity, building => building.apartments, { onDelete: 'CASCADE' })
  building: BuildingEntity;

  @ManyToOne(() => OwnerEntity, owner => owner.apartments, { onDelete: 'SET NULL' })
  owner: OwnerEntity;

  @ManyToMany(() => OptionEntity)
  @JoinTable()
  options: OptionEntity[];

  @OneToMany(() => TenantEntity, tenant => tenant.apartment)
  tenants: TenantEntity[];

  @ManyToOne(() => ApartmentTypeEntity, apartmentType => apartmentType.apartments, { onDelete: 'SET NULL' })
  apartmentType: ApartmentTypeEntity;
}