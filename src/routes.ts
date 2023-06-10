import { Routes } from '@nestjs/core';
import { ApiModule } from './api/api.module';
import { ClientModule } from './client/client.module';

export const routes: Routes = [
  {
    path: '/api',
    module: ApiModule,
  },
  {
    path: '/client',
    module: ClientModule,
  },
];
