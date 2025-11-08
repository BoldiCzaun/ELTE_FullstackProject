import { Component } from '@angular/core';
import { CourseList } from "../course-list/course-list";

@Component({
  selector: 'app-main-page',
  imports: [CourseList],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css'
})
export class MainPage {

}
