import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Course from './course';

@Component({
  selector: '[id="app"]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    // @ts-ignore
    window.backend.getStartYear().then(r => {
      this.startYearOptions = r
    })

    // @ts-ignore
    window.backend.getStartTerm().then(r => {
      this.startTermOptions = r
    })

    // @ts-ignore
    window.backend.getGrades().then(r => {
      this.grades = r;
      this._changeDetectorRef.detectChanges();
    })
  }

  GRADES = {
    A: 4,
    B: 3,
    C: 2,
    F: 0,
  }
  title = 'my-app';

  cgpa: string = '0';

  clickMessage = '';

  startTermOptions = [];
  startYearOptions = [];
  grades = [];

  selectedStartYear = [];
  selectedStartTerm = [];



  allCourses = [];
  availableCourses = [];
  availableTerms = [];

  selectedCourse = '';

  selectedTerm = '';

  selectedGrade = '';


  get getCompletedCourses() {
    return this.allCourses.filter(c => c.courseGrade)
  }

  get getPendingCourses() {
    return this.allCourses.filter(c => !c.courseGrade)
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) {

  }


  preview = '';

  terms = [];

  handleFileInput(files: any) {
    var file = files[0];
    var reader = new FileReader();

    if (file && file.type.match(/text.*/)) {
      reader.onload = async (event) => {
        try {
          // @ts-ignore
          let content = event.target.result;
          this.allCourses = [];
          content.toString().split("\n").forEach(async (element) => {
            element = element.replace("\r", "")
            let course: any = element.split('|');
            if (course[2]) {
              course[2] = course[2].split(',').map((a: any) => {
                let preq: any = a.trim().split(' ').filter(x => x.trim());

                if (preq.length > 1) {
                  if (!isNaN(preq[1].slice(-3))) {
                    return preq.join(',')
                  }
                }
                return a.trim();
              }).join(',').trim()

              let preq = course[2].split(',')
              var seen = {};
              var ret_arr = [];
              for (var i = 0; i < preq.length; i++) {
                if (!(preq[i] in seen)) {
                  ret_arr.push(preq[i]);
                  seen[preq[i]] = true;
                }
              }
              course[2] = Object.keys(seen).join('||');
            }

            // @ts-ignore
            let re = await window.backend.addCourse(course[0], course[1], course[2], course[3], course[4])
            let _course = new Course(re);
            this.allCourses.push(_course);
            this.setAvailableCourses();
            this._changeDetectorRef.detectChanges();
          });
          this.setCGPA();
          this.preview = '<span class="text-success">Schema upload success.</span>';
          this._changeDetectorRef.detectChanges();

        } catch (error) {
          console.warn(error);
          this.preview = "<span class='text-danger'>It doesn't seem to be a valid text file!</span>";
        }
      }
    } else {
      this.preview = "<span class='text-danger'>It doesn't seem to be a valid text file!</span>";
    }
    reader.readAsText(file);

  }

  setCGPA() {
    var course_count = 0;
    var cgpa = 0;
    this.allCourses.forEach(course => {
      if (course.courseGrade) {
        cgpa = cgpa + this.GRADES[course.courseGrade]
        course_count = course_count + 1
      }
    })
    this.cgpa = (course_count > 0) ? (cgpa / course_count).toFixed(2) : '0';
  }

  setAvailableCourses() {
    this.availableCourses = this.allCourses.filter((course: Course) => {
      console.log(course.courseCode, course.courseGrade);

      if (course.courseGrade) {
        console.log("1111");

        return false;
      } else if (course.courseDependentCourses.length) {
        for (let index = 0; index < course.courseDependentCourses.length; index++) {
          let i = this.allCourses.findIndex((c: Course) => c.courseCode == course.courseDependentCourses[index])
          if (i > -1 && (!this.allCourses[i].courseGrade || this.allCourses[i].courseGrade == 'F')) {
            console.log("2222");
            return false;
          }
        }
        console.log("333");
        return true;
      }
      console.log("44");

      return true;
    }).map(course => course.courseCode);

    console.log(this.availableCourses);
    this._changeDetectorRef.detectChanges();
  }

  TERMS = ['Spring', 'Summer', 'Fall'];


  formTerms(start_term, year) {
    let termsList = [];
    if (start_term) {
      let index = this.TERMS.findIndex(s => s == start_term) + 1;
      for (let i = 0; i < this.TERMS.length; i++) {
        if (index < this.TERMS.length) {
          termsList.push(`${this.TERMS[index]} ${year}`);
        } else {
          index = 0;
          year = year + 1
          termsList.push(`${this.TERMS[index]} ${year}`);
        }
        index += 1;
      }
    }
    return termsList
  }
  creditHours = '0';

  setAvailableTerms() {
    let completedAt = null;
    try {
      let i = this.allCourses.findIndex(c => c.courseCode == this.selectedCourse)
      if (i > -1 && this.allCourses[i].courseDependentCourses.length) {
        let courseDependentCourse = this.allCourses[i].courseDependentCourses[this.allCourses[i].courseDependentCourses.length - 1]
        i = this.allCourses.findIndex(c => c.courseCode == courseDependentCourse)

        completedAt = this.allCourses[i].courseCompletedAt

      }
    } catch (err) {
    }

    let termsList = [];
    if (completedAt) {
      var [start_term, year] = completedAt.split(" ")
      year = parseInt(year)
    } else {
      year = this.selectedStartYear ? this.selectedStartYear : (new Date()).getFullYear();
      start_term = this.selectedStartTerm;
    }
    this.availableTerms = this.formTerms(start_term, year)
    this._changeDetectorRef.detectChanges();
  }

  onCourseChange() {
    this.setAvailableTerms();
    let i = this.allCourses.findIndex(c => c.courseCode == this.selectedCourse)

    if (i > -1) {
      this.creditHours = this.allCourses[i].courseCreditHours
      this._changeDetectorRef.detectChanges()
    }
  }

  updateCourse() {
    let i = this.allCourses.findIndex((c: Course) => c.courseCode == this.selectedCourse);
    if (i > -1) {
      this.allCourses[i].courseGrade = this.selectedGrade
      this.allCourses[i].courseCompletedAt = this.selectedTerm;
      this.setCGPA();
      this.setAvailableCourses();
      this.resetAll();
      this._changeDetectorRef.detectChanges();
    }
  }

  resetAll() {
    this.selectedCourse = '';
    this.selectedGrade = '';
    this.selectedTerm = '';
    this.creditHours = '';
  }

  getSchemaContent() {
    let list = this.allCourses.map(s => s.formLine());
    return list.join("\n");
}

  downloadSchema() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.getSchemaContent()));
    element.setAttribute('download', (new Date()).toLocaleString() + '-schema.txt');//file name set here
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
}
