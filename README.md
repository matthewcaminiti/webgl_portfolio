# webgl portfolio

# dev

- run webpack build watcher, and serve current dir

`npm run dev`

`live-server`

# deploy

- `/assets`, `/dist`, and `index.html` are symlinked to `/opt/webgl_portfolio/public`
- nginx points to `/opt/webgl_portfolio/public`

1. push to master
2. ssh rpi
3. pull latest
4. run `npm run build:prod`

### TODO:

- ~~draw grid~~
- ~~add player character (circle)~~
- ~~load map of squares onto grid~~
- ~~add collision with walls + boundary~~
- ~~add raycasting visualization~~
- ~~fix cell-clamping on raycasts~~
- ~~switch to 3d rendering (verticles lines)~~
- ~~fix fisheye~~
- ~~perspective (parallel parallels)~~
- ~~colour walls based on cell val (+location in cell??)~~
- ~~floor + ceiling~~
- ~~add camera movement (mouse)~~
- texture walls+floor+ceiling
- add texture selection
- add sprites (always-facing player)

### Yolos:

- verticality, create steps/increase z
- add jumping
- add physical objects
- shadows/DOF
