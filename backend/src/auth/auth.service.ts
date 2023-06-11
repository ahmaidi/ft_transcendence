import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private databaseService: DatabaseService,
    ) {}

    async getLoginCookie(user: User, tfa: boolean) {
        return `Authentication=${await this.jwtService.signAsync({ sub: user.id, tfa: tfa })}; Path=/`;
    }

    async validateUser(profile: any) {
        const user = await this.databaseService.user.findUnique({
            where: { id: parseInt(profile.id) }
        });

        if (user) {
            return user;
        } else {
            const write = fs.createWriteStream('./upload/' + profile.id + '.jpg');

            const response = await axios.get(profile._json.image.link, { responseType: 'stream' });

            response.data.pipe(write);

            return await this.databaseService.user.create({
                data: {
                    id: parseInt(profile.id),
                    username: profile.username,
                },
            });
        }
    }
}