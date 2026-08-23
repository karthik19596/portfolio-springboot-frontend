import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly isAdmin = computed(() => this.authService.user()?.role === 'ADMIN');

  readonly initials = computed(() => {
    const username = this.authService.user()?.username ?? '';
    return username.slice(0, 2).toUpperCase() || '?';
  });

  constructor() {
    // The token carries only username and role, so the email shown in the menu
    // has to come from the API once a session exists.
    effect(() => {
      if (this.authService.isAuthenticated() && !this.authService.profile()) {
        this.authService.loadProfile().subscribe({ error: () => undefined });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
