# Terra Explorer

Explore Earth on a 3D globe. Click a place (or search for a city) to see its temperature, weather, air quality and a five-day outlook.

Built with React, Three.js (via react-three-fiber) and Vite. Data comes from Open-Meteo and BigDataCloud, both free and keyless.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo with a `main` branch.
2. In the repo, open Settings > Pages and set Source to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.

Your URL will be `https://<user>.github.io/<repo>/`.

## Notes
- Earth texture: the app loads `public/textures/earth.jpg` if present, otherwise a CDN copy. Add your own equirectangular image there to self-host.
- `vite.config.js` uses a relative base, so no repo name needs configuring.
- Commit `package-lock.json` after your first install, then change the workflow's `npm install` to `npm ci`.

## Next ideas
Day/night terminator, weather layers (clouds, wind), country borders, pinned comparison locations.
