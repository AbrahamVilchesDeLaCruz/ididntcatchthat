import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('page_views')
export class PageViewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  path: string;

  @Column({ name: 'visitor_id', length: 100 })
  visitorId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
