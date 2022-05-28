package course

import (
	"strings"
)

type StudentCourse struct {
	Course       string   `json:"course"`
	Credits      string   `json:"credits"`
	Dependent    []string `json:"dependent"`
	Completed_at string   `json:"completed_at"`
	Grade        string   `json:"grade"`
}

func getDependentCourses(e string) []string {

	dependentCourses := strings.Split(strings.TrimSpace(e), "||")
	return dependentCourses
}

func New(coursename string,
	credits string,
	dependents string,
	completed_at string,
	grade string) StudentCourse {
	e := StudentCourse{coursename, credits, getDependentCourses(dependents), completed_at, grade}
	return e
}

func getGrade(e StudentCourse) string {
	return e.Grade
}
