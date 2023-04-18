export default {
  base: "/TDrive/",
  title: "Documentation",
  description: "Public API documentation",
  themeConfig: {
    logo: "https://tdrive.app/images/logo-tdrive.svg",
    sidebar: [
      {
        text: "Getting started",
        items: [
          {
            text: "☀️ Welcome to TDrive",
            link: "index",
          },
        ],
      },
      {
        text: "On-premise",
        items: [
          {
            text: "🏗 Run On-Premise",
            link: "/onprem/installation",
          },
          {
            text: "⚙️ Server configuration",
            link: "/onprem/configuration/index.md",
          },
        ],
      },
      {
        text: "Internal documentation",
        items: [
          {
            text: "Our stack",
            link: "/internal-documentation/our-stack",
          },
          {
            text: "Translation",
            link: "/internal-documentation/translation",
          },
          {
            text: "Backend services",
            items: [
              {
                text: "Get started",
                link: "/internal-documentation/backend-services/intro/README.md",
              },
              {
                text: "Documents",
                link: "/internal-documentation/backend-services/documents/README.md",
              },
              {
                text: "Files",
                link: "/internal-documentation/backend-services/files/README.md",
              },
              {
                text: "Tags",
                link: "/internal-documentation/backend-services/tags/README.md",
              },
            ],
          },

          {
            text: "Frontend components",
            items: [
              {
                text: "Get started",
                link: "/internal-documentation/frontend-components/intro/README.md",
              },
            ],
          },
        ],
      },
    ],
  },
  head: [],
};
