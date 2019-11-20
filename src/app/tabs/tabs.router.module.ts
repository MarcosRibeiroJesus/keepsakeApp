import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../commons/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab1/tab1.module').then(m => m.Tab1PageModule)
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab2/tab2.module').then(m => m.Tab2PageModule)
          }
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab3/tab3.module').then(m => m.Tab3PageModule)
          }
        ]
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../home/home.module').then(m => m.HomePageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'fanpage',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../fanpage/fanpage.module').then(m => m.FanpagePageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'message',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../message/message.module').then(m => m.MessagePageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'photos',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../photos/photos.module').then(m => m.PhotosPageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../users/users.module').then(m => m.UsersPageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../profile/profile.module').then(m => m.ProfilePageModule),
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
