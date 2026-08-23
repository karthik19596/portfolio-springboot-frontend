import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionMonitorService } from './services/session-monitor.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.scss',
})
export class App {
  title = 'Task Portfolio';

  // Injected for its side effect: nothing else references the monitor, and a
  // root-provided service is not constructed until something asks for it.
  private readonly sessionMonitor = inject(SessionMonitorService);
}
