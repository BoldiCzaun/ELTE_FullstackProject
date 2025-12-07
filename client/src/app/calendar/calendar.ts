import { Component, inject, signal } from '@angular/core';
import { CalendarPreviousViewDirective, CalendarTodayDirective, CalendarNextViewDirective, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarDatePipe, DateAdapter, provideCalendar, CalendarEvent, CalendarView } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CourseService } from '../course-service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendar',
  imports: [CalendarPreviousViewDirective, CalendarTodayDirective, CalendarNextViewDirective, CalendarMonthViewComponent, CalendarWeekViewComponent, CalendarDayViewComponent, CalendarDatePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
})
export class Calendar {
  protected courseService = inject(CourseService);

  protected refresh = new Subject<void>();
  protected view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  protected viewDate = new Date();
  protected events = signal<CalendarEvent[]>([]);

  protected setView(view: CalendarView) {
    this.view = view;
    this.refresh.next();
  }

  constructor() {
    this.courseService.getUserCourses().subscribe(v => {
        if(!v) return;

        for (const course of v) {
          this.courseService.getRequirements(course.id.toString()).subscribe(req => {
            if(!req) return;
            
            let convertedEvents: CalendarEvent[] = [];

            for (const requirement of req) {
              let event: CalendarEvent = {
                title: course.name + " - " + requirement.name,
                start: new Date(requirement.begin),
                end: new Date(requirement.begin),
              };
              
              if(requirement.repeat_count != null) {
                for(let i = 0; i < requirement.repeat_count; ++i) {
                  let startDate = new Date(requirement.begin);
                  startDate.setDate(startDate.getDate() + i * 7 * (requirement.repeat_skip || 1));

                  let repeatEvent: CalendarEvent = {
                    title: event.title + " (" + (i+1) + ".)",
                    start: startDate,
                    end: startDate,
                  };
                  convertedEvents.push(repeatEvent);  
                }
              }
              else {
                convertedEvents.push(event);  
              }
            }
          
            this.events.update(arr => arr.concat(convertedEvents));
            this.refresh.next();
          })
        }
      });

  }
}
