This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Vyhledávání souřadnic v administraci

Ve formulářích pro přidání i úpravu místa se po změně adresy a opuštění pole
(nebo stisku Enter) vyhledá poloha přes [Photon](https://github.com/komoot/photon).
Jediný výsledek se doplní automaticky, více výsledků vyžaduje výběr lokality.
Tlačítkem „Vyhledat souřadnice“ lze hledání zopakovat i pro uloženou adresu.
Změna adresy vymaže předchozí souřadnice; ruční zadání souřadnic zruší probíhající hledání.
Pouhé otevření existující lokality její souřadnice nemění.

Vyhledávání odesílá zadanou adresu veřejné službě `photon.komoot.io` a používá
data © OpenStreetMap contributors. Není potřeba API klíč. Veřejný server je určen
pro přiměřený provoz a negarantuje dostupnost; při chybě lze polohu zadat ručně.
Výsledky se během otevření aplikace ukládají do omezené paměťové cache.
Pro vlastní instanci lze před sestavením nastavit `NEXT_PUBLIC_GEOCODING_URL`
na URL kompatibilního Photon `/api/` endpointu s povoleným CORS.

Testy geokódování: `npm test`.

Souřadnice se ukládají v desetinných stupních WGS84 (šířka −90 až 90,
délka −180 až 180). Starší neplatné hodnoty je nutné opravit v administraci;
aplikace je automaticky nepřevádí ani neodhaduje. Do opravy se takové body
nezobrazují na přehledové mapě a odkazy Google Maps / Mapy.com vyhledávají
podle názvu a adresy, místo aby předávaly neplatnou polohu.

## Lokální spuštění

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# vylety-web" 
"# vylety-web" 
