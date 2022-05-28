export default class Course {

    public courseCode:string;
    public courseCreditHours:string;
    public courseDependentCourses:Array<any>;
    public courseCompletedAt:string;
    public courseGrade:string;

    constructor(course:string) {
        let CourseObject = JSON.parse(course);
        this.courseCode = CourseObject.course;
        this.courseCreditHours = CourseObject.credits;
        this.courseDependentCourses = CourseObject.dependent;
        this.courseCompletedAt = CourseObject.completed_at;
        this.courseGrade = CourseObject.grade;
    }

    public formLine() {
        return [this.courseCode, this.courseCreditHours, this.courseDependentCourses.join(','), this.courseCompletedAt, this.courseGrade].join('|');
    }

}