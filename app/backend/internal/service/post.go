package service

import (
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

func contains(tags []string, tag string) bool {
	for _, t := range tags {
		if t == tag {
			return true
		}
	}
	return false
}
