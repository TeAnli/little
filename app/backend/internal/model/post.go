package model

type Post struct {
	Slug    string   `json:"slug"`
	Title   string   `json:"title"`
	Date    string   `json:"date"`
	Tags    []string `json:"tags"`
	Summary string   `json:"summary"`
	Content string   `json:"content,omitempty"`
}

type PostListResponse struct {
	Posts []Post `json:"posts"`
	Total int    `json:"total"`
	Page  int    `json:"page"`
	Size  int    `json:"size"`
}

type Tag struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type CreatePostPayload struct {
	Title   string   `json:"title"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
	Summary string   `json:"summary"`
}

type UpdatePostPayload struct {
	Title   string   `json:"title"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
	Summary string   `json:"summary"`
	Date    string   `json:"date"`
}
