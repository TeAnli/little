package service

import (
	"errors"
	"slices"
	"strings"
	"time"

	"little-blog/backend/internal/model"
	"little-blog/backend/internal/repository"
)

type PostService struct{ repo *repository.PostRepo }

func NewPostService(repo *repository.PostRepo) *PostService {
	return &PostService{repo: repo}
}

func (s *PostService) List(tag string, page, size int) *model.PostListResponse {
	all := s.repo.All()

	var filtered []*model.Post
	for _, p := range all {
		if tag == "" || contains(p.Tags, tag) {
			filtered = append(filtered, p)
		}
	}

	total := len(filtered)
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 10
	}

	start := (page - 1) * size
	if start > total {
		start = total
	}
	end := start + size
	if end > total {
		end = total
	}

	slice := filtered[start:end]
	posts := make([]model.Post, len(slice))
	for i, p := range slice {
		posts[i] = *p
		posts[i].Content = ""
	}

	return &model.PostListResponse{
		Posts: posts,
		Total: total,
		Page:  page,
		Size:  size,
	}
}

func (s *PostService) Get(slug string) (*model.Post, bool) {
	return s.repo.BySlug(slug)
}

func (s *PostService) Tags() []model.Tag {
	return s.repo.Tags()
}

func (s *PostService) Create(p model.CreatePostPayload) (*model.Post, error) {
	if err := validatePost(p.Title, p.Content); err != nil {
		return nil, err
	}

	slug := repository.Slugify(p.Title)
	post := &model.Post{
		Slug: slug, Title: p.Title,
		Date: time.Now().Format("2006-01-02"),
		Tags: p.Tags, Summary: p.Summary, Content: p.Content,
	}
	if err := s.repo.Create(post); err != nil {
		return nil, err
	}
	return post, nil
}

func (s *PostService) Update(slug string, p model.UpdatePostPayload) (*model.Post, error) {
	if err := validatePost(p.Title, p.Content); err != nil {
		return nil, err
	}

	date := p.Date
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	post := &model.Post{
		Slug: slug, Title: p.Title, Date: date,
		Tags: p.Tags, Summary: p.Summary, Content: p.Content,
	}
	if err := s.repo.Update(slug, post); err != nil {
		return nil, err
	}
	return post, nil
}

func (s *PostService) Delete(slug string) error {
	return s.repo.Delete(slug)
}

func validatePost(title, content string) error {
	if len(strings.TrimSpace(title)) == 0 {
		return errors.New("title is required")
	}
	if len(title) > 200 {
		return errors.New("title too long")
	}
	if len(strings.TrimSpace(content)) == 0 {
		return errors.New("content is required")
	}
	return nil
}

func contains(tags []string, tag string) bool {
	return slices.Contains(tags, tag)
}
