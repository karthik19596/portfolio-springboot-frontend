import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/auth';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  loading = signal(false);
  hidePassword = signal(true);
  hideConfirm = signal(true);

  usernameError = signal<string | null>(null);
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  confirmPasswordError = signal<string | null>(null);
  generalError = signal<string | null>(null);

  ngOnInit(): void {
    this.registerForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrors());

    this.registerForm.get('username')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.registerForm.get('username')?.setErrors(null);
        this.generalError.set(null);
        this.updateErrors();
      });

    this.registerForm.get('email')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.registerForm.get('email')?.setErrors(null);
        this.generalError.set(null);
        this.updateErrors();
      });

    this.registerForm.get('confirmPassword')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.confirmPasswordError.set(null);
      });
  }

  checkUsernameAvailability(): void {
    const username = this.registerForm.get('username')?.value;
    if (!username || this.registerForm.get('username')?.invalid) {
      return;
    }

    this.authService.isUsernameAvailable(username).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.registerForm.get('username')?.setErrors({
            serverError: 'Username already taken',
          });
          this.registerForm.get('username')?.markAsTouched();
          this.updateErrors();
        }
      },
      error: () => {
        // ignore availability check errors
      },
    });
  }

  checkEmailAvailability(): void {
    const email = this.registerForm.get('email')?.value;
    if (!email || this.registerForm.get('email')?.invalid) {
      return;
    }

    this.authService.isEmailAvailable(email).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.registerForm.get('email')?.setErrors({
            serverError: 'Email already registered',
          });
          this.registerForm.get('email')?.markAsTouched();
          this.updateErrors();
        }
      },
      error: () => {
        // ignore availability check errors
      },
    });
  }

  register(): void {
    this.updateErrors();
    this.generalError.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.updateErrors();
      this.generalError.set('Please fix the errors above before submitting.');
      return;
    }

    const formValue = this.registerForm.value;
    if (formValue.password !== formValue.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match.');
      this.registerForm.get('confirmPassword')?.markAsTouched();
      this.generalError.set('Passwords do not match.');
      return;
    }

    const request: SignupRequest = {
      username: formValue.username!,
      email: formValue.email!,
      password: formValue.password!,
    };

    this.loading.set(true);
    this.authService.signup(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.router.navigate(['/tasks']);
        } else {
          this.showError(response.message || 'Registration failed.');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.handleServerError(error.error?.message || '');
      },
    });
  }

  private handleServerError(message: string): void {
    const lower = message.toLowerCase();

    if (lower.includes('username')) {
      this.registerForm.get('username')?.setErrors({ serverError: message });
      this.registerForm.get('username')?.markAsTouched();
    } else if (lower.includes('email')) {
      this.registerForm.get('email')?.setErrors({ serverError: message });
      this.registerForm.get('email')?.markAsTouched();
    } else {
      this.showError(message || 'Could not create account. Please try again.');
    }
    this.updateErrors();
  }

  private updateErrors(): void {
    this.usernameError.set(this.fieldError('username'));
    this.emailError.set(this.fieldError('email'));
    this.passwordError.set(this.fieldError('password'));
    this.confirmPasswordError.set(this.fieldError('confirmPassword'));
  }

  private fieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    if (!control || !(control.touched || control.dirty) || !control.errors) {
      return null;
    }

    const errors = control.errors;

    if (errors['serverError']) {
      return errors['serverError'];
    }
    if (errors['required']) {
      if (fieldName === 'confirmPassword') {
        return 'Please confirm your password.';
      }
      return 'This field is required.';
    }
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (errors['minlength'] || errors['maxlength']) {
      if (fieldName === 'username') {
        return 'Username must be 3-50 characters.';
      }
      if (fieldName === 'password') {
        return 'Password must be at least 6 characters.';
      }
    }

    return 'Invalid value.';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'error-snackbar',
    });
  }
}
