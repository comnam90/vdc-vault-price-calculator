# VDC Vault TCO Calculator

An unofficial TCO comparison tool for [Veeam Data Cloud Vault](https://www.veeam.com/products/veeam-data-cloud/vault.html). Compare VDC Vault costs against DIY cloud storage across 60+ global regions.

> **Disclaimer:** This is an unofficial, community-maintained tool. It is not affiliated with, endorsed by, or supported by Veeam Software. All pricing is approximate and based on publicly available list prices. Always verify with your Veeam representative or cloud provider for accurate quotes.

## What It Does

Select a cloud region, term length (1-5 years), and storage capacity (TiB) to see a 4-way cost comparison:

| Comparison               | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **VDC Vault Foundation** | Veeam Data Cloud Vault Foundation edition RRP             |
| **VDC Vault Advanced**   | Veeam Data Cloud Vault Advanced edition RRP               |
| **DIY Cloud Option 1**   | Azure Blob Hot / AWS S3 Standard (self-managed)           |
| **DIY Cloud Option 2**   | Azure Blob Cool / AWS S3 Infrequent Access (self-managed) |

DIY costs are broken down into: Storage, Write Operations, Read Operations, Data Retrieval, and Internet Egress.

Results are displayed as summary cards, a stacked bar chart, and a detailed cost breakdown table.

## Data Sources

- **Region availability:** [VDC Services Map API](https://vdcmap.bcthomas.com) (community-maintained)
- **Cloud storage pricing:** Static data based on published Azure Blob Storage and AWS S3 list prices
- **VDC Vault pricing:** Based on published Veeam recommended retail prices

## Tech Stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 7
- [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Table](https://tanstack.com/table) for data tables
- [Recharts](https://recharts.org/) for charts
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests in watch mode
npm run test:run     # Single test run
npm run lint         # Lint
```

## Contributing

This project follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) and [Conventional Commits](https://www.conventionalcommits.org/).

## License

MIT
