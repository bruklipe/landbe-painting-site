# L & BE Painting Co. Website

Two-page static website for `L & BE Painting Co.` rebuilt around:

- the transparent logo PNG as a colorable brand mark
- real residential, commercial, hospitality, institutional, and industrial project photos
- direct phone/email contact actions
- a short project reel video

## Main files

- `index.html`
- `projects.html`
- `content.js`
- `script.js`
- `styles.css`

## Contact info

Update shared contact details in:

- `content.js`

## Preview locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/projects.html`

## Media notes

- Real project images are stored in `assets/projects/`
- The video reel lives in `assets/media/project-reel.mp4`
- Raw DNG files were not used directly because browsers need web-safe image formats
