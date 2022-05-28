package main

import (
	_ "embed"
	"encoding/json"
	"time"

	"github.com/wailsapp/wails"

	course "my-project/student"
)

func basic() string {
	return "Hello World!"
}

type MyCourses struct {
	Items []course.StudentCourse
}

func (coursecontent *MyCourses) AddItem(item course.StudentCourse) []course.StudentCourse {
	coursecontent.Items = append(coursecontent.Items, item)
	return coursecontent.Items
}

func addCourse(coursename string,
	credits string,
	dependents string,
	completed_at string,
	grade string) string {
	s := course.New(coursename, credits, dependents, completed_at, grade)
	j, _ := json.Marshal(s)
	return string(j)
}

func getStartYear() []int {
	t := time.Now()
	year := t.Year()

	var list []int
	for i := 0; i < 5; i++ {
		list = append(list, year-i)
	}
	return list
}

func getStartTerm() []string {
	return []string{"Spring", "Summer", "Fall"}
}

func getGrades() []string {
	return []string{"A", "B", "C", "F"}
}

//go:embed frontend/dist/my-app/main.js
var js string

//go:embed frontend/dist/my-app/styles.css
var css string

func main() {

	app := wails.CreateApp(&wails.AppConfig{
		Width:     1024,
		Height:    768,
		Title:     "Student Adviser",
		JS:        js,
		CSS:       css,
		Colour:    "#131313",
		Resizable: true,
	})
	app.Bind(basic)
	app.Bind(addCourse)
	app.Bind(getGrades)
	app.Bind(getStartYear)
	app.Bind(getStartTerm)

	app.Run()
}
