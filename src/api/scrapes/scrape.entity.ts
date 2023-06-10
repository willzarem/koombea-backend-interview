import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScrapeStatus } from './scrape-status.enum';
import { ScrapeContent } from './scrape-content.entity';

@Entity()
export class Scrape {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  linksFound: number;

  @Column()
  status: ScrapeStatus;

  @ManyToOne(() => User, (user) => user.scrapes, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;

  @OneToMany(() => ScrapeContent, (content) => content.scrape, { eager: true })
  @Exclude({ toPlainOnly: true })
  contents: ScrapeContent[];
}
