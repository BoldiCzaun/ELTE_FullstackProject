import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course, CourseService, Score } from '../course-service';

@Component({
  selector: 'app-scores-page',
  imports: [],
  templateUrl: './scores-page.html',
  styleUrl: './scores-page.css'
})
export class ScoresPage {
  private route = inject(ActivatedRoute);
  protected courseService = inject(CourseService);

  protected scores = signal<Score[] | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) {
      console.error("scores page: id was null");
      return;
    }

    const req_id = this.route.snapshot.paramMap.get('req_id');
    if(!req_id) {
      console.error("scores page: req_id was null");
      return;
    }

    this.courseService.getCourseScores(id, req_id).subscribe(v => {
      if(!v) return;
      this.scores.set(v);
    });
  }
}
