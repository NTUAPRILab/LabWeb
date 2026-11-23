import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from '../sections/hero';
import { Showcase } from '../sections/showcase';
import { Research } from '../sections/research';
import { Projects } from '../sections/projects';
import { News } from '../sections/news';

@Component({
  selector: 'app-home-page',
  imports: [Hero, Showcase, Research, Projects, News],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <app-showcase />
    <app-research />
    <app-projects />
    <app-news />
  `,
})
export class HomePage {}
