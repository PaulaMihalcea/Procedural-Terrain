# WebGL Procedural Terrain Generator
## Author: Paula Mihalcea

![](https://img.shields.io/github/repo-size/paulamihalcea/procedural-terrain) ![](https://img.shields.io/github/size/paulamihalcea/procedural-terrain/proceduralTerrain.js?color=light%20green&label=main%20script%20size)


This project aims to create a <b>procedural</b> (infinite) <b>terrain</b> using the <b>three.js</b> JavaScript library. The terrain itself is made of a 3x3 matrix of tiles that are continuosly generated as the scene moves, by using one among three different pseudorandom noise algorithms: <b>Perlin noise</b>, <b>Simplex noise</b> and <b>Diamond-Square noise</b>.

The <b>tile generation algorithm</b> that allows the new tiles to perfectly match the old ones on their edges has been specially created for this project by the author.

A series of <b>dat.GUI</b>, <b>mouse</b> and <b>keyboard controls</b> allow the user to change the terrain and scene parameters, as well as move around the camera.

---

This project uses the following libraries:

- [three.js](https://github.com/mrdoob/three.js/) by [Mr.doob](https://mrdoob.com/) (main library)
- [dat.GUI](https://github.com/dataarts/dat.gui) by [Google Data Arts Team](https://github.com/dataarts) (graphical user interface)
- [noiseJS](https://github.com/josephg/noisejs) by [Joseph Gentle](https://josephg.com/blog/) (Perlin & Simplex noise)
- [Olsen noise](https://gamedev.stackexchange.com/a/129104) by [Tatarize](http://godsnotwheregodsnot.blogspot.com/) (deterministic, infinite Diamond-Square noise)

---

<i>The main script file (`proceduralTerrain.js`) has been <b>heavily commented</b> in the hopes that people trying to re-create this project will better understand how the scene and terrain generation works, since the author has deemed insufficiently documented other similar projects found around the web.</i>
