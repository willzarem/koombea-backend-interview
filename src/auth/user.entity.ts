import { Scrape } from 'src/api/scrapes/scrape.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Scrape, (scrape) => scrape.user, { eager: true })
  scrapes: Scrape[];
}
