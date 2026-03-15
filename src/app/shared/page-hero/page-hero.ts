import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type HeroActionVariant = 'cta' | 'ghost';

export type HeroAction = {
  label: string;

  link: string;
  variant?: HeroActionVariant;


  external?: boolean;


  download?: string;


  targetBlank?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-page-hero',
  imports: [CommonModule, RouterLink],
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.scss',
})
export class PageHeroComponent {
  @Input({ required: true }) title = '';
  @Input() highlight?: string;
  @Input() subtitle?: string;

  @Input() imgSrc?: string;
  @Input() imgAlt = '';

  @Input() chips?: string[];

  @Input() actions?: HeroAction[];


  @Input() imgScale = 1.0;
  @Input() imgPosX = 50;
  @Input() imgPosY = 50;

  isExternal(a: HeroAction): boolean {
  if (a.external) return true;

  return /^(https?:|mailto:|tel:)/i.test(a.link);
}

 hrefFor(a: HeroAction): string {
  if (/^(https?:|mailto:|tel:)/i.test(a.link)) {
    return a.link;
  }

  return a.link.startsWith('/') ? a.link : `/${a.link}`;
}
trackByValue = (_: number, v: string) => v;
trackByAction = (_: number, a: HeroAction) => a.label;
}
