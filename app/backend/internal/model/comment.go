package model

type Comment struct {
	ID        int64      `json:"id"`
	PostSlug  string     `json:"post_slug"`
	ParentID  *int64     `json:"parent_id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Content   string     `json:"content"`
	CreatedAt string     `json:"created_at"`
	Replies   []*Comment `json:"replies,omitempty"`
}

type CommentPayload struct {
	ParentID *int64 `json:"parent_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Content  string `json:"content"`
}
