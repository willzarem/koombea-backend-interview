import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Scrape } from './scrape.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ScrapeContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToOne(() => Scrape, (scrape) => scrape.contents, { eager: false })
  @Exclude({ toPlainOnly: true })
  scrape: Scrape;
}
