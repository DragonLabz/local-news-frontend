import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  users: User[] = [];
  newUser: Omit<User, 'id'> = { name: '', email: '' }; // Exclude id for new users
  editUser: User | null = null;
  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users) => {
        this.users = users;
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = `Failed to load users: ${this.getErrorMessage(err)}`;
      }
    });
  }

  addUser() {
    if (!this.newUser.name.trim() || !this.newUser.email.trim()) {
      this.errorMessage = 'Name and email are required';
      return;
    }
    this.http.post<User>(this.apiUrl, this.newUser).subscribe({
      next: (user) => {
        this.users.push(user);
        this.newUser = { name: '', email: '' };
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = `Failed to add user: ${this.getErrorMessage(err)}`;
      }
    });
  }

  editUserStart(user: User) {
    this.editUser = { ...user };
  }

  updateUser() {
    if (!this.editUser || !this.editUser.name.trim() || !this.editUser.email.trim()) {
      this.errorMessage = 'Name and email are required';
      return;
    }
    this.http.put<User>(`${this.apiUrl}/${this.editUser.id}`, this.editUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.editUser = null;
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = `Failed to update user: ${this.getErrorMessage(err)}`;
      }
    });
  }

  deleteUser(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = `Failed to delete user: ${this.getErrorMessage(err)}`;
      }
    });
  }

  cancelEdit() {
    this.editUser = null;
    this.errorMessage = null;
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.error instanceof ErrorEvent) {
      // Client-side error
      return err.error.message;
    } else {
      // Server-side error
      if (typeof err.error === 'string') {
        return err.error;
      } else if (err.error && typeof err.error === 'object') {
        return err.error.message || JSON.stringify(err.error);
      }
      return err.message || 'Unknown error';
    }
  }
}
