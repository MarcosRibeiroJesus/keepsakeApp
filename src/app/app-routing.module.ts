import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './commons/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule), 
    canActivate: [AuthGuard]
  },
  { path: 'photos', loadChildren: () => import('./photos/photos.module').then(m => m.PhotosPageModule), canActivate: [AuthGuard] },
  { path: 'fanpage', loadChildren: () => import('./fanpage/fanpage.module').then(m => m.FanpagePageModule), canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule), canActivate: [AuthGuard] },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule), canActivate: [AuthGuard] },
  { path: 'message', loadChildren: () => import('./message/message.module').then(m => m.MessagePageModule), canActivate: [AuthGuard] },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule), canActivate: [AuthGuard] },
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)},
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'reset-password', loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordPageModule) }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
