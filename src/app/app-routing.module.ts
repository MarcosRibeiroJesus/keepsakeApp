import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: "./pages/login/login.module#LoginPageModule",
    canActivate: [LoginGuard]
  },
  {
    path: 'tabs',
    loadChildren: "./pages/tabs/tabs.module#TabsPageModule",
  },
  { path: 'photos', loadChildren: "./pages/photos/photos.module#PhotosPageModule", canActivate: [AuthGuard] },
  { path: 'fanpage', loadChildren: "./pages/fanpage/fanpage.module#FanpagePageModule", canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: "./pages/profile/profile.module#ProfilePageModule", canActivate: [AuthGuard] },
  { path: 'users', loadChildren: "./pages/users/users.module#UsersPageModule", canActivate: [AuthGuard] },
  { path: 'message', loadChildren: "./pages/message/message.module#MessagePageModule" },
  { path: 'message/:id', loadChildren: "./pages/message/message.module#MessagePageModule", canActivate: [AuthGuard] },
  { path: 'home', loadChildren: "./pages/home/home.module#HomePageModule", canActivate: [AuthGuard] },
  { path: 'register', loadChildren: "./pages/register/register.module#RegisterPageModule" },
  { path: 'login', loadChildren: "./pages/login/login.module#LoginPageModule", canActivate: [LoginGuard] },
  { path: 'reset-password', loadChildren: "./pages/reset-password/reset-password.module#ResetPasswordPageModule" },
  { path: 'messages', loadChildren: './pages/message/messages.module#MessagesPageModule', canActivate: [AuthGuard] },
  { path: 'chat', loadChildren: './pages/chat/chat.module#ChatPageModule', canActivate: [AuthGuard] },
  { path: 'comments/:id', loadChildren: './pages/message/comments.module#CommentsPageModule', canActivate: [AuthGuard] }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
