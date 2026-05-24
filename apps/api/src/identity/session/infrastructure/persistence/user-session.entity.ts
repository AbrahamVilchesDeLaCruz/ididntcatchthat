import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'token_id', unique: true })
  tokenId: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'owner_type', type: 'varchar', length: 10 })
  ownerType: 'user' | 'guest';

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'fingerprint', type: 'text' })
  fingerprint: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', nullable: true, type: 'timestamp' })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
