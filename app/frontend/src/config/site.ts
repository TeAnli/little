export interface SocialLink {
  label: string;
  url: string;
  display: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  social: {
    github: SocialLink;
  };
  footer: {
    copyrightPrefix: string;
  };
}

export const siteConfig: SiteConfig = {
  title: 'Little Blog',
  description: '一个极简的个人博客。',
  author: 'TeAnli',
  hero: {
    eyebrow: 'Little Blog',
    title: '在这里，留下一些慢慢想清楚的东西。',
    subtitle: '写给当下，也写给之后回头看的自己。',
  },
  social: {
    github: {
      label: 'GitHub',
      url: 'https://github.com/TeAnli',
      display: 'TeAnli',
    },
  },
  footer: {
    copyrightPrefix: '©',
  },
};
