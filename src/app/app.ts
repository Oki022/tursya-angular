import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root component: the header and the place where the current page is shown. */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
