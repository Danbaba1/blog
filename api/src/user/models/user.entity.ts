import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    username: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    password: string;

    @Column({nullable: true})
    profileImageUrl: string;

    @Column({nullable: true})
    profileImageId: string;

    @Column("simple-array", { nullable: true })
    previousPasswords: string[]; // Array of hashed passwords

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}
