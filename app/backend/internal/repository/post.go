package repository

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"little-blog/backend/internal/model"

	"gopkg.in/yaml.v3"
)

type PostRepo struct {
	mu         sync.RWMutex
	posts      map[string]*model.Post
	sorted     []*model.Post
	contentDir string
}

func NewPostRepo(contentDir string) (*PostRepo, error) {
	r := &PostRepo{posts: make(map[string]*model.Post), contentDir: contentDir}
	return r, r.load(contentDir)
}

func (r *PostRepo) load(dir string) error {
	entries, err := os.ReadDir(filepath.Join(dir, "posts"))
	if err != nil {
		return err
	}

	var all []*model.Post
	for _, e := range entries {
		if !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		p, err := parsePost(filepath.Join(dir, "posts", e.Name()))
		if err != nil {
			continue
		}
		all = append(all, p)
	}

	sort.Slice(all, func(i, j int) bool { return all[i].Date > all[j].Date })

	r.mu.Lock()
	for _, p := range all {
		r.posts[p.Slug] = p
	}
	r.sorted = all
	r.mu.Unlock()
	return nil
}

type frontMatter struct {
	Title   string   `yaml:"title"`
	Date    string   `yaml:"date"`
	Tags    []string `yaml:"tags"`
	Slug    string   `yaml:"slug"`
	Summary string   `yaml:"summary"`
}

func parsePost(path string) (*model.Post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	text := string(data)
	fm, body, _ := splitFM(text)

	var m frontMatter
	yaml.Unmarshal([]byte(fm), &m)

	if m.Slug == "" {
		base := filepath.Base(path)
		m.Slug = strings.TrimSuffix(base, ".md")
	}

	return &model.Post{
		Slug:    m.Slug,
		Title:   m.Title,
		Date:    m.Date,
		Tags:    m.Tags,
		Summary: m.Summary,
		Content: strings.TrimSpace(body),
	}, nil
}

func splitFM(text string) (string, string, error) {
	text = strings.TrimSpace(text)
	if !strings.HasPrefix(text, "---") {
		return "", text, nil
	}
	rest := text[3:]
	idx := strings.Index(rest, "---")
	if idx == -1 {
		return "", text, nil
	}
	return rest[:idx], rest[idx+3:], nil
}

func (r *PostRepo) All() []*model.Post {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]*model.Post, len(r.sorted))
	copy(out, r.sorted)
	return out
}

func (r *PostRepo) BySlug(slug string) (*model.Post, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.posts[slug]
	return p, ok
}

func (r *PostRepo) dir() string {
	return r.contentDir
}

func (r *PostRepo) Create(p *model.Post) error {
	dir := filepath.Join(r.contentDir, "posts")
	os.MkdirAll(dir, 0755)
	return writePost(dir, p)
}

func (r *PostRepo) Update(slug string, p *model.Post) error {
	dir := filepath.Join(r.contentDir, "posts")
	if _, ok := r.posts[slug]; !ok {
		return os.ErrNotExist
	}
	return writePost(dir, p)
}

func (r *PostRepo) Delete(slug string) error {
	if _, ok := r.posts[slug]; !ok {
		return os.ErrNotExist
	}
	filePath := filepath.Join(r.contentDir, "posts", slug+".md")
	if err := os.Remove(filePath); err != nil {
		return err
	}
	r.mu.Lock()
	delete(r.posts, slug)
	for i, p := range r.sorted {
		if p.Slug == slug {
			r.sorted = append(r.sorted[:i], r.sorted[i+1:]...)
			break
		}
	}
	r.mu.Unlock()
	return nil
}

func writePost(dir string, p *model.Post) error {
	tagsJSON, _ := yaml.Marshal(p.Tags)
	content := "---\n" +
		"title: \"" + p.Title + "\"\n" +
		"date: \"" + p.Date + "\"\n" +
		"tags: " + strings.TrimSpace(string(tagsJSON)) + "\n" +
		"slug: \"" + p.Slug + "\"\n" +
		"summary: \"" + p.Summary + "\"\n" +
		"---\n\n" + p.Content
	return os.WriteFile(filepath.Join(dir, p.Slug+".md"), []byte(content), 0644)
}

func (r *PostRepo) Tags() []model.Tag {
	r.mu.RLock()
	defer r.mu.RUnlock()
	m := make(map[string]int)
	for _, p := range r.sorted {
		for _, t := range p.Tags {
			m[t]++
		}
	}
	tags := make([]model.Tag, 0, len(m))
	for name, count := range m {
		tags = append(tags, model.Tag{Name: name, Count: count})
	}
	sort.Slice(tags, func(i, j int) bool { return tags[i].Count > tags[j].Count })
	return tags
}
