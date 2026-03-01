import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer/footer';

type NavItem = { label: string; path: string };

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  nav: NavItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Herramienta de decisión', path: '/decision' },
    { label: 'Procedimiento', path: '/procedimiento' },
    { label: 'Biblioteca de resultados', path: '/biblioteca' },
    { label: 'Acerca de', path: '/acerca' },
  ];
}
